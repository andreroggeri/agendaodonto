import { NextFunction, Request, Response } from 'express';
import logger from '../logging';
import { settings } from '../settings';

export default function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('No authorization header found');
    res.status(401).json({ status: 'Unauthorized' });
    return;
  }
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer') {
    logger.warn('Invalid authorization type');
    res.status(401).json({ status: 'Unauthorized' });
    return;
  }
  if (token !== settings.secrets.apiKey) {
    logger.warn('Invalid authorization token');
    res.status(401).json({ status: 'Unauthorized' });
    return;
  }

  next();
}
