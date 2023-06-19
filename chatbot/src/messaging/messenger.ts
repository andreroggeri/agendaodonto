import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  proto,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Redis } from 'ioredis';
import { extractPhoneFromJid } from '../phone';
import { settings } from '../settings';
import { MessengerCache } from './cache';

const STORE_KEY = 'whatsapp_store';

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
      console.log('onmessage', JSON.stringify(event, null, 2));
      if (event.type === 'notify') {
        event.messages.forEach((message) => {
          if (
            message.key.remoteJid !== 'status@broadcast' &&
            !message.key.fromMe &&
            message.message?.extendedTextMessage?.text
          ) {
            if (message.key.remoteJid) {
              callback({ from: message.key.remoteJid, content: message.message?.extendedTextMessage.text });
            }
          }
        });
      }
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
    const { state, saveCreds } = await useMultiFileAuthState(settings.authenticationPath);
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
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
            console.warn('You are logged out.');
            process.exit(1);
          } else {
            console.warn('Connection closed. You are logged out.');
            process.exit(1);
          }
        }

        console.log('connection update', update);
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

    return status[0].exists;
  }

  private async initStoreHandler(): Promise<void> {
    this.store = makeInMemoryStore({});
    if (this.storeHandlerInterval) {
      clearInterval(this.storeHandlerInterval);
    }
    const storeData = await this.redis.get(STORE_KEY);

    if (storeData) {
      console.info('Loading store from redis');
      this.store.fromJSON(JSON.parse(storeData));
    }

    this.storeHandlerInterval = setInterval(() => {
      const data = JSON.stringify(this.store.toJSON());
      this.redis.set(STORE_KEY, data).catch(console.error);
    }, 10_000);

    this.store.bind(this.socket.ev);
  }
}
