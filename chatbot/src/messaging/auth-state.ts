import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
} from '@whiskeysockets/baileys';
import { Redis } from 'ioredis';
import logger from '../logging';

export const useRedisAuth = async (
  redis: Redis,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const writeData = async (data: any, file: string) => {
    await redis.set(fixFileName(file), JSON.stringify(data, BufferJSON.replacer));
  };

  const readData = async (file: string) => {
    try {
      const data = await redis.get(fixFileName(file));
      if (!data) {
        return null;
      }
      return JSON.parse(data, BufferJSON.reviver);
    } catch (error) {
      return null;
    }
  };

  const removeData = async (file: string) => {
    try {
      await redis.del(fixFileName(file));
    } catch (err) {
      logger.error(`Error deleting file ${file}`, err);
    }
  };

  const fixFileName = (file: string) => file?.replace(/\//g, '__')?.replace(/:/g, '-');

  const creds: AuthenticationCreds = (await readData('creds.json')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}.json`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }

              data[id] = value;
            }),
          );

          return data;
        },
        set: async (data) => {
          const tasks: Array<Promise<void>> = [];
          for (const category in data) {
            // @ts-expect-error
            for (const id in data[category]) {
              // @ts-expect-error
              const value = data[category][id];
              const file = `${category}-${id}.json`;
              tasks.push(value ? writeData(value, file) : removeData(file));
            }
          }

          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      await writeData(creds, 'creds.json');
    },
  };
};
