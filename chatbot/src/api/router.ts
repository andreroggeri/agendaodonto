import { Router } from 'express';
import authMiddleware from '../authentication/auth-middleware';
import { Messenger } from '../messaging/messenger';
import { handleMessageRequest } from './messages';

export default function buildApiRouter(messenger: Messenger) {
  const apiRouter = Router();
  apiRouter.use(authMiddleware);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  apiRouter.post('/messages', async (req, res) => await handleMessageRequest(req, res, messenger));

  return apiRouter;
}
