import Redis = require('ioredis');
import { settings } from './settings';

export const redis = new Redis(settings.redisUrl);
