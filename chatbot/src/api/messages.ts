import { Request, Response } from 'express';
import { Messenger } from '../messaging/messenger';

export async function handleMessageRequest(req: Request, res: Response, messenger: Messenger) {
  const { phone, message } = req.body as { phone: string, message: string };
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  const jid = `55${phone}@s.whatsapp.net`;
  const hasAccount = await messenger.phoneHasAccount(jid);
  if (!hasAccount) {
    return res.status(400).json({ error: 'phone does not have an account' });
  }

  await messenger.sendMessage(jid, message);
  return res.status(200).json({ sent: true });
}
