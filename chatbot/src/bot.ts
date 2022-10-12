import slugify from 'slugify';
import * as flows from './buttons';
import { ClientContext } from './context';
import { Messenger } from './messaging/messenger';
import { redis } from './redis';
import { settings } from './settings';

async function saveContext(messageAuthor: string, context: ClientContext) {
  const content = JSON.stringify(context);
  await redis.set(messageAuthor, content);
}

async function loadContext(messageAuthor: string): Promise<ClientContext> {
  const data = await redis.get(messageAuthor);
  if (data) {
    return ClientContext.fromObject(JSON.parse(data));
  }

  return new ClientContext(flows.initialFlow);
}

async function handleMessage(client: Messenger, from: string, content: string) {
  const context = await loadContext(from);
  console.log(context);
  if (content.includes('!ping')) {
    console.log('replying');
    client.sendMessage(from, 'pong');
    client.sendButtons(from, flows.initialFlow.message, flows.initialFlow.buttons);
  }

  if (context.isLastInteractionTooOld) {
    console.log('Last interaction was too old, restarting from the beginning');
    flows.runFlow(flows.initialFlow, client, from);
    context.setCurrentFlow(flows.initialFlow);
    saveContext(from, context);
    return;
  }
}

async function handleButtonResponse(client: Messenger, from: string, selectedButtonId: string) {
  const context = await loadContext(from);
  const currentFlow = context.getCurrentFlow();

  const selectedButton = currentFlow.buttons.find((b) => slugify(b.text, { lower: true }) === selectedButtonId);

  if (!selectedButton) {
    client.sendMessage(from, 'Resposta inválida');
    return;
  }

  const nextFlow = selectedButton.nextFlow;

  flows.runFlow(nextFlow, client, from);

  context.setCurrentFlow(nextFlow);

  saveContext(from, context);
}

(async () => {
  console.log('Settings => ', settings);

  const messenger = new Messenger(redis);
  await messenger.init();

  messenger.onMessage(({ from, content }) => {
    console.log('message received', { from, content, includes: !from.includes('0437') });
    if (settings.TEST_MODE && content !== '!ping' && !from.includes('0437')) {
      console.info('TEST_MODE enabled, Ignoring message !');
      return;
    }

    redis.lpush('messages', JSON.stringify({ from, content }));

    handleMessage(messenger, from, content);
  });

  messenger.onButtonResponse(({ from, selectedButtonId }) => {
    console.log('button response received', { from, selectedButtonId });
    if (settings.TEST_MODE && !from.includes('0437')) {
      console.info('TEST_MODE enabled, Ignoring message !');
      return;
    }

    redis.lpush('button_responses', JSON.stringify({ from, content: selectedButtonId }));

    handleButtonResponse(messenger, from, selectedButtonId);
  });

  console.log('Chatbot is running :)');
})();
