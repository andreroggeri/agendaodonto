import * as express from 'express';
import { exit } from 'process';
import slugify from 'slugify';
import buildApiRouter from './api/router';
import * as flows from './buttons';
import { loadContext } from './context';
import { Messenger } from './messaging/messenger';
import { redis } from './redis';
import { settings } from './settings';
import { vision } from './vision';

async function handleMessage(client: Messenger, from: string, content: string) {
  const context = await loadContext(from);
  console.log(context);
  if (content.includes('!ping')) {
    console.log('replying', { from });
    await client.sendMessage(from, 'pong');
    await client.sendButtons(from, flows.initialFlow.message, flows.initialFlow.buttons);
  }

  if (context.isLastInteractionTooOld) {
    console.log('Last interaction was too old, restarting from the beginning');
    flows.runFlow(flows.initialFlow, client, from);
    context.setCurrentFlow(flows.initialFlow);
    await context.saveContext();
  }
}

async function handleButtonResponse(client: Messenger, from: string, selectedButtonId: string) {
  const context = await loadContext(from);
  const currentFlow = context.getCurrentFlow();

  const selectedButton = currentFlow.buttons.find((b) => slugify(b.text, { lower: true }) === selectedButtonId);

  if (!selectedButton) {
    await client.sendMessage(from, 'Resposta inválida');
    return;
  }

  const nextFlow = selectedButton.nextFlow;

  flows.runFlow(nextFlow, client, from);

  context.setCurrentFlow(nextFlow);

  await context.saveContext();
}

async function handleImage(client: Messenger, from: string, image: Buffer) {
  // const context = await loadContext(from);

  // const currenetState = context.getCurrentFlow().state;

  // console.log('Received image', { from, url });
  const [result] = await vision.textDetection(image);
  const hasCardNumber = result.fullTextAnnotation?.text?.match(/\d{9}\n/);
  if (hasCardNumber) {
    const cardNumber = hasCardNumber[0].trim();
    console.log({ cardNumber });
  } else {
    console.warn('No card number found');
  }
  // console.log(hasCardNumber);
}

void (async () => {
  const safeSecrets = Object.entries(settings.secrets).reduce((acc, [key, value]) => {
    acc[key] = `${value.substring(0, 2)}*****${value.substring(value.length - 2)}`;
    return acc;
  }, {} as Record<string, string>);

  console.log('Settings => ', { ...settings, secrets: safeSecrets });

  const messenger = new Messenger(redis);
  await messenger.init();

  messenger.onMessage(async ({ from, content }) => {
    console.log('message received', { from, content });
    if (settings.testMode && content !== '!ping' && !from.includes('8371')) {
      console.info('TEST_MODE enabled, Ignoring message !');
      return;
    }

    await redis.lpush('messages', JSON.stringify({ from, content }));

    await handleMessage(messenger, from, content);
  });

  messenger.onButtonResponse(async ({ from, selectedButtonId }) => {
    console.log('button response received', { from, selectedButtonId });
    if (settings.testMode && !from.includes('8371')) {
      console.info('TEST_MODE enabled, Ignoring message !');
      return;
    }

    await redis.lpush('button_responses', JSON.stringify({ from, content: selectedButtonId }));

    await handleButtonResponse(messenger, from, selectedButtonId);
  });

  messenger.onImage(async ({ from, image }) => {
    await handleImage(messenger, from, image);
  });

  const app = express();
  app.use(express.json());

  app.get('/healthcheck', async (req, res) => {
    try {
      const status = await messenger.status();
      return res.status(200).json(status);
    } catch {
      console.error('healthcheck failed');
      exit(1);
    }
  });

  app.use('/v1/', buildApiRouter(messenger));

  app.listen(settings.port, () => {
    console.log(`Chatbot is running on :${settings.port}`);
  });
})();
