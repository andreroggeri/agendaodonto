import { PrismaClient } from '@prisma/client';
import { settings } from './settings';

const db = new PrismaClient({
  log: settings.prismaLogLevel,
});

export default db;
