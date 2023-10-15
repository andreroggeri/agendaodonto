import { Request, Response } from 'express';
import { loadContext } from '../context';
import { Messenger } from '../messaging/messenger';

enum SendMessageErrors {
  NO_ACCOUNT = 'NO_ACCOUNT',
}

export async function handleMessageRequest(req: Request, res: Response, messenger: Messenger) {
  const { phone, message } = req.body as { phone: string; message: string };
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  const jid = `55${phone}@s.whatsapp.net`;
  const hasAccount = await messenger.phoneHasAccount(jid);
  if (!hasAccount) {
    return res.status(422).json({ error: SendMessageErrors.NO_ACCOUNT });
  }

  await messenger.sendMessage(jid, message);

  const context = await loadContext(jid);
  context.setCurrentFlow('finishFlow');
  await context.save();
  return res.status(200).json({ sent: true });
}
