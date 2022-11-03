import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  proto,
  useMultiFileAuthState,
} from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import { Redis } from 'ioredis';
import slugify from 'slugify';
import { WhatsappButton } from '../buttons';
import { settings } from '../settings';

const STORE_KEY = 'whatsapp_store';
const retryMap = {};

export class Messenger {
  private socket: ReturnType<typeof makeWASocket>;
  private store: ReturnType<typeof makeInMemoryStore>;
  private storeHandlerInterval: NodeJS.Timer;

  constructor(private readonly redis: Redis) {}

  async sendMessage(to: string, content: string): Promise<proto.WebMessageInfo | undefined> {
    return await this.socket.sendMessage(to, { text: content });
  }

  async sendButtons(to: string, text: string, buttons: WhatsappButton[]): Promise<proto.WebMessageInfo | undefined> {
    const buttonsMessage = buttons.map((button) => {
      return {
        buttonId: slugify(button.text, { lower: true }),
        buttonText: {
          displayText: button.text,
        },
        type: 1,
      };
    });

    const buttonMessage = {
      text,
      buttons: buttonsMessage,
    };

    return await this.socket.sendMessage(to, buttonMessage);
  }

  onMessage(callback: (message: { from: string; content: string }) => void): void {
    this.socket.ev.on('messages.upsert', (event) => {
      if (event.type === 'notify') {
        event.messages.forEach((message) => {
          if (message.key.remoteJid !== 'status@broadcast' && !message.key.fromMe && message.message?.conversation) {
            if (message.key.remoteJid) {
              callback({ from: message.key.remoteJid, content: message.message?.conversation });
            }
          }
        });
      }
    });
  }

  onButtonResponse(callback: (message: { from: string; selectedButtonId: string }) => void): void {
    this.socket.ev.on('messages.upsert', (event) => {
      const messageWithButtons = event.messages.filter((message) => message.message?.buttonsResponseMessage);
      if (event.type === 'notify' && messageWithButtons.length > 0) {
        messageWithButtons.forEach((message) => {
          if (message.key.remoteJid && message.message?.buttonsResponseMessage?.selectedButtonId) {
            callback({
              from: message.key.remoteJid,
              selectedButtonId: message.message.buttonsResponseMessage.selectedButtonId,
            });
          }
        });
      }
    });
  }

  async init(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(settings.AUTHENTICATION_PATH);
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      msgRetryCounterMap: retryMap,
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
