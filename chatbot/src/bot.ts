import * as express from 'express';
import { exit } from 'process';
import slugify from 'slugify';
import buildApiRouter from './api/router';
import apiService, { TreatmentRequestStatus } from './api/services/api.service';
import { ConversationState, flows, runFlow } from './buttons';
import { loadContext } from './context';
import { Messenger } from './messaging/messenger';
import { extractPhoneFromJid } from './phone';
import { redis } from './redis';
import { settings } from './settings';
import { vision } from './vision';

async function handleMessage(client: Messenger, from: string, content: string) {
  const context = await loadContext(from);
  console.log(context);
  if (content.includes('!reset')) {
    await client.sendMessage(from, 'Okay!');
    context.setCurrentFlow('initialFlow');
    await context.save();
  }
  if (content.includes('!ping')) {
    console.log('replying', { from });
    await client.sendMessage(from, 'pong');
  }

  if (context.isLastInteractionTooOld) {
    console.log('Last interaction was too old, restarting from the beginning');
    await runFlow('initialFlow', client, from);
    context.setCurrentFlow('initialFlow');
    await context.save();
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

  await runFlow(nextFlow, client, from);

  context.setCurrentFlow(nextFlow);

  await context.save();
}

async function handleImage(client: Messenger, from: string, image: Buffer) {
  try {
    const context = await loadContext(from);

    const flow = context.getCurrentFlow();

    if (![ConversationState.GatheringAmilCard, ConversationState.GatheringInterondontoCard].includes(flow.state)) {
      console.log('Received image but not expecting one', { state: flow.state, from });
      return;
    }

    const [result] = await vision.textDetection(image);
    let cardNumberMatch: RegExpMatchArray | null | undefined;
    let dentalPlanName: string;
    switch (flow.state) {
      case ConversationState.GatheringAmilCard:
        cardNumberMatch = result.fullTextAnnotation?.text?.replace(/ /g, '').match(/\d{9}\n/g);
        dentalPlanName = 'amil';
        break;
      case ConversationState.GatheringInterondontoCard:
        dentalPlanName = 'interodonto';
        cardNumberMatch = result.fullTextAnnotation?.text
          ?.split('\n')
          .map((t) => t.replace(/[^0-9]+/g, ''))
          .filter((t) => t.length === 23);
        break;
      default:
        throw new Error('Invalid state');
    }

    console.log({ result: result.fullTextAnnotation?.text?.replace(/ /g, '') });
    if (cardNumberMatch) {
      const found = [...cardNumberMatch].map((c) => c.trim());
      console.log('Found card numbers: ', { foundCardNumbers: found });
      const dentalPlan = await apiService.findDentalPlanByName(dentalPlanName);

      for (const cardNumber of found) {
        console.log('Creating treatment request', { cardNumber, dentalPlan });
        await apiService.createTreatmentRequest({
          dental_plan: dentalPlan.id,
          dental_plan_card_number: cardNumber,
          patient_phone: extractPhoneFromJid(from),
          dentist_phone: client.phoneNumber,
          status: TreatmentRequestStatus.PENDING,
          clinic: settings.scheduleApi.clinicId,
        });
      }
    } else {
      console.warn('No card number found');
    }
  } catch (err) {
    console.error('Failed to handle message', err);
  }
}

void (async () => {
  const safeSecrets = Object.entries(settings.secrets).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = `${value.substring(0, 2)}*****${value.substring(value.length - 2)}`;
    return acc;
  }, {});

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
