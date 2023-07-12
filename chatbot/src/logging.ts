import { createLogger, format } from 'winston';
import { Console } from 'winston/lib/winston/transports';
import { settings } from './settings';

const messageFormatter = format.printf((info) => {
  const { timestamp, service, level, message, ...meta } = info as { [key: string]: string };
  return `${timestamp} ${service} ${level}: ${message} ${JSON.stringify(meta)}`;
});
const localFormats = format.combine(format.json(), format.colorize(), format.timestamp(), messageFormatter);
const remoteFormats = format.combine(format.timestamp(), format.json());

const logger = createLogger({
  level: settings.logLevel,
  transports: [
    new Console({
      format: process.env.NODE_ENV === 'production' ? remoteFormats : localFormats,
    }),
  ],
  defaultMeta: { service: 'messaging' },
});

export default logger;
