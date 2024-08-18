import * as express from 'express';
import { exit } from 'process';
import buildApiRouter from './api/router';
import apiService, { TreatmentRequestStatus } from './api/services/api.service';
import { ConversationState, runFlow } from './buttons';
import { loadContext } from './context';
import logger from './logging';
import { Messenger } from './messaging/messenger';
import { extractPhoneFromJid } from './phone';
import { redis } from './redis';
import { settings } from './settings';
import { vision } from './vision';

async function handleMessage(client: Messenger, from: string, content: string) {
  const context = await loadContext(from);
  logger.info('Context found', { context });
  if (content.includes('!reset')) {
    await client.sendMessage(from, 'Okay!');
    await context.reset();
    return;
  }
  if (content.includes('!ping')) {
    logger.info('replying', { from });
    await client.sendMessage(from, 'pong');
    return;
  }

  if (context.isLastInteractionTooOld) {
    logger.info('Last interaction was too old, restarting from the beginning');
    await runFlow('initialFlow', client, from);
    context.setCurrentFlow('initialFlow');
    await context.save();
    return;
  }

  // Extract numbers from response
  const buttonIdx = parseInt(content.match(/\d+/g)?.[0] ?? '');
  if (Number.isNaN(buttonIdx)) {
    logger.info('Received non-numeric response', { from, content });
    return;
  }

  const flow = context.getCurrentFlow();
  const flowButton = flow.buttons[buttonIdx - 1];
  if (flow.buttons.length === 0) {
    return;
  }
  if (!flowButton) {
    logger.info('Received invalid response', { from, content, buttonIdx });
    const validOptions = flow.buttons.map((b, idx) => `[${idx + 1}] ${b.text}`).join('\n');
    await client.sendMessage(from, `Opção inválida. Escolha uma das opções abaixo:\n${validOptions}`);
    return;
  }

  await runFlow(flowButton.nextFlow, client, from);
  context.setCurrentFlow(flowButton.nextFlow);
  await context.save();
}

async function handleImage(client: Messenger, from: string, image: Buffer) {
  try {
    const context = await loadContext(from);

    const flow = context.getCurrentFlow();

    if (![ConversationState.GatheringAmilCard, ConversationState.GatheringInterondontoCard].includes(flow.state)) {
      logger.warn('Received image but not expecting one', { state: flow.state, from });
      return;
    }

    const [result] = await vision.textDetection(image);
    let cardNumberMatch: string[] | null | undefined;
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

    if (cardNumberMatch) {
      const found = [...cardNumberMatch].map((c) => c.trim());
      logger.info('Found card numbers: ', { foundCardNumbers: found });
      const dentalPlan = await apiService.findDentalPlanByName(dentalPlanName);

      for (const cardNumber of found) {
        logger.info('Creating treatment request', { cardNumber, dentalPlan });
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
      logger.warn('No card number found');
    }
  } catch (err) {
    logger.error('Failed to handle message', err);
  }
}

void (async () => {
  const safeSecrets = Object.entries(settings.secrets).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = `${value.substring(0, 2)}*****${value.substring(value.length - 2)}`;
    return acc;
  }, {});

  logger.info('Settings => ', { ...settings, secrets: safeSecrets });

  const messenger = new Messenger(redis);
  await messenger.init();

  messenger.onMessage(async ({ from, content }) => {
    logger.info('message received', { from, content });

    await redis.lpush('messages', JSON.stringify({ from, content }));

    await handleMessage(messenger, from, content);
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
      logger.error('healthcheck failed');
      exit(1);
    }
  });

  app.use('/v1/', buildApiRouter(messenger));

  app.use('/events', async (req, res) => {
    logger.info('Received events', { body: req.body });

    const messageType = req.body.message?.type;

    switch (messageType) {
      case 'end-of-call-report':
        const number = req.body.message?.call?.customer?.number;
        logger.info('Received end-of-call-report', { number });
        if (number) {
          const numberWithoutPlusSign = number.replace('+', '');
          const jid = `${numberWithoutPlusSign}@s.whatsapp.net`;
          if (await messenger.phoneHasAccount(jid)) {
            messenger.sendMessage(jid, 'Olá, aqui é do consultório odontológico. Vi que você acabou de ligar. Qualquer dúvida estamos a disposição.');
          }
        }
        return res.status(200).json({ status: 'ok' });
        break;
      default:
        return res.status(200).json({ status: 'ok' });
    }
  });

  app.listen(settings.port, () => {
    logger.info(`Chatbot is running on :${settings.port}`);
  });
})();
