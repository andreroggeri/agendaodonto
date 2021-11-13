import { Client, ClientOptions, Message } from 'whatsapp-web.js';
import * as flows from './buttons';
import { ClientContext } from './context';
import { redis } from './redis';
import { settings } from './settings';

async function saveContext(messageAuthor: string, context: ClientContext) {
    const content = JSON.stringify(context)
    await redis.set(messageAuthor, content)
}

async function loadContext(messageAuthor: string): Promise<ClientContext> {
    const data = await redis.get(messageAuthor)
    if (data) {
        return ClientContext.fromObject(JSON.parse(data))
    }

    return new ClientContext(flows.initialFlow);
}

async function handleMessage(client: Client, message: Message) {
    const context = await loadContext(message.from);
    console.log(context);
    if (message.body == '!ping') {
        message.reply('pong!')
    }

    if (context.isLastInteractionTooOld) {
        console.log('Last interaction was too old, restarting from the beginning')
        flows.runFlow(flows.initialFlow, client, message)
        context.setCurrentFlow(flows.initialFlow)
        saveContext(message.from, context)
        return
    }

    if (message.type.toString() === 'buttons_response') {
        console.log('Response from a button')
        const currentFlow = context.getCurrentFlow();

        const selectedButton = currentFlow.buttons.find(b => b.text === message.body);

        if (!selectedButton) {
            client.sendMessage(message.from, 'Resposta inválida', { sendSeen: false });
            return;
        }

        const nextFlow = selectedButton.nextFlow;

        flows.runFlow(nextFlow, client, message)

        context.setCurrentFlow(nextFlow);

        saveContext(message.from, context);
    }
}

console.log('Settings => ', settings)
const puppeteerOptions = {
    headless: false,
};
const browserlessOptions = {
    browserWSEndpoint: settings.BROWSERLESS_URL
}
const options: ClientOptions = {
    puppeteer: settings.DEV_MODE ? puppeteerOptions : browserlessOptions as any,
    session: settings.SESSION_DATA,
    restartOnAuthFail: true,
    takeoverOnConflict: true,
}
const whatsapp = new Client(options);

whatsapp.on('authenticated', async (credentials) => {
    console.log('Authenticated')
});

whatsapp.on('auth_failure', (err) => {
    console.error('Authentication failure', err)
    process.exit(1)
})

whatsapp.on('disconnected', (err) => {
    console.error('Disconnected', err)
    process.exit(1)
})

whatsapp.on('ready', () => {
    console.log('ready')

    setInterval(async () => {
        const state = await whatsapp.getState()
        console.log('State: ', state)
        await whatsapp.getChats();
    }, 5000);
})

whatsapp.on('change_state', (state) => {
    console.log('Change state', state)
})
whatsapp.on('qr', () => {
    console.log('qrcode')
})

whatsapp.on('message', message => {
    if (settings.TEST_MODE && message.body !== '!ping') {
        return;
    }

    redis.lpush('messages', JSON.stringify(message))
    console.log(JSON.stringify(message, null, 2))
    if (message.from.includes('@g.us') || message.from.includes('@broadcast') || message.type.toString() === 'e2e_notification') {
        console.log('Ignoring message');
        return;
    }

    handleMessage(whatsapp, message);
});




(async () => {
    await whatsapp.initialize();
    console.log(await whatsapp.getWWebVersion())
})()