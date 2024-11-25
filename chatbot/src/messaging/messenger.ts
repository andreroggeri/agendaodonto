import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  WAMessage,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  proto
} from '@whiskeysockets/baileys';
import { Redis } from 'ioredis';
import database from '../database';
import logger from '../logging';
import { extractPhoneFromJid } from '../phone';
import { useRedisAuth } from './auth-state';
import { MessengerCache } from './cache';
import Long = require('long');

const STORE_KEY = 'whatsapp_store';

function extractTimestamp(message: WAMessage): number {
  if (message.messageTimestamp) {
    if (typeof message.messageTimestamp === 'string') {
      return parseInt(message.messageTimestamp) * 1000;
    } else if (message.messageTimestamp instanceof Long) {
      return message.messageTimestamp.low * 1000;
    } else {
      return message.messageTimestamp * 1000;
    }
  } else {
    return Date.now();
  }
}

export class Messenger {
  private socket: ReturnType<typeof makeWASocket>;
  private store: ReturnType<typeof makeInMemoryStore>;
  private storeHandlerInterval: NodeJS.Timer;

  get phoneNumber() {
    const me = this.socket.authState.creds.me;
    return extractPhoneFromJid(me?.id ?? '');
  }

  constructor(private readonly redis: Redis) {}

  async sendMessage(to: string, content: string): Promise<proto.WebMessageInfo | undefined> {
    return await this.socket.sendMessage(to, { text: content });
  }

  onMessage(callback: (message: { from: string; content: string }) => any): void {
    this.socket.ev.on('messages.upsert', (event) => {
      logger.debug('onmessage', { event });
      event.messages.forEach(async (message) => {
        if (message.key.remoteJid) {
          const messageTs = extractTimestamp(message);
          try {
            await database.message.create({
              data: {
                conversationKey: message.key.remoteJid,
                content: message.message?.extendedTextMessage?.text ?? message.message?.conversation ?? '',
                isFromMe: message.key.fromMe ?? false,
                timestamp: new Date(messageTs),
                pushName: message.pushName ?? '',
              },
            });
          } catch (e) {
            logger.error('Failed to save message', { message, e });
          }
        }
        if (message.key.remoteJid !== 'status@broadcast' && !message.key.fromMe && message.key.remoteJid) {
          const content = message.message?.extendedTextMessage?.text ?? message.message?.conversation ?? '';
          if (content) {
            callback({ from: message.key.remoteJid, content });
          }
        }
      });
    });
  }

  onImage(callback: (message: { from: string; image: Buffer }) => any): void {
    this.socket.ev.on('messages.upsert', async (event) => {
      if (event.type === 'notify') {
        const imageMessages = event.messages.filter((message) => message.message?.imageMessage);
        for (const message of imageMessages) {
          if (message.key.remoteJid !== 'status@broadcast' && message.key.remoteJid) {
            const image = (await downloadMediaMessage(message, 'buffer', {})) as Buffer;
            callback({ from: message.key.remoteJid, image });
          }
        }
      }
    });
  }

  async init(): Promise<void> {
    const { state, saveCreds } = await useRedisAuth(this.redis);
    const baileysData = await fetchLatestBaileysVersion();
    logger.info(`Baileys version: ${baileysData.version.toString()}`, baileysData);
    this.socket = makeWASocket({
      version: baileysData.version,
      auth: state,
      printQRInTerminal: true,
      msgRetryCounterCache: new MessengerCache(),
    });

    this.socket.ev.process(async (event) => {
      if (event['connection.update'] != null) {
        const update = event['connection.update'];
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
            logger.warn('You are logged out.');
            process.exit(1);
          } else {
            logger.warn('Connection closed. You are logged out.');
            process.exit(1);
          }
        }

        logger.debug('connection update', { update });
      }
      if (event['creds.update'] != null) {
        await saveCreds();
      }
    });

    await this.socket.waitForSocketOpen();

    await this.initStoreHandler();
  }

  async status(): Promise<{ ok: boolean; blockList: string[] }> {
    const timeout = setTimeout(() => {
      throw new Error('timeout');
    }, 5_000);
    const blockList = await this.socket.fetchBlocklist();
    clearTimeout(timeout);
    return { ok: true, blockList };
  }

  async phoneHasAccount(jid: string): Promise<boolean> {
    const status = await this.socket.onWhatsApp(jid);
    if (status.length === 0) {
      return false;
    }

    return status[0].exists;
  }

  private async initStoreHandler(): Promise<void> {
    // @ts-expect-error
    this.store = makeInMemoryStore({ logger: undefined });
    if (this.storeHandlerInterval) {
      clearInterval(this.storeHandlerInterval);
    }
    const storeData = await this.redis.get(STORE_KEY);

    if (storeData) {
      this.store.fromJSON(JSON.parse(storeData));
    }

    this.storeHandlerInterval = setInterval(() => {
      const data = JSON.stringify(this.store.toJSON());
      this.redis.set(STORE_KEY, data).catch(logger.error);
    }, 10_000);

    this.store.bind(this.socket.ev);
  }
}
