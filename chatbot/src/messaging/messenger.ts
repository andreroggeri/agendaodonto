import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
} from '@adiwajshing/baileys';
import { Boom } from '@hapi/boom';
import { Redis } from 'ioredis';
import slugify from 'slugify';
import { WhatsappButton } from '../buttons';

const STORE_KEY = 'whatsapp_store';
const retryMap = {};

export class Messenger {
  private socket: ReturnType<typeof makeWASocket>;
  private store: ReturnType<typeof makeInMemoryStore>;
  private storeHandlerInterval: NodeJS.Timer;

  constructor(private redis: Redis) {}

  sendMessage(to: string, content: string) {
    this.socket.sendMessage(to, { text: content });
  }
  sendButtons(to: string, text: string, buttons: WhatsappButton[]) {
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

    this.socket.sendMessage(to, buttonMessage);
  }
  onMessage(callback: (message: { from: string; content: string }) => void) {
    this.socket.ev.on('messages.upsert', (event) => {
      if (event.type === 'notify') {
        event.messages.forEach((message) => {
          if (
            message.key.remoteJid !== 'status@broadcast' &&
            message.key.fromMe === false &&
            message.message.conversation
          ) {
            callback({ from: message.key.remoteJid, content: message.message?.conversation });
          }
        });
      }
    });
  }

  onButtonResponse(callback: (message: { from: string; selectedButtonId: string }) => void) {
    this.socket.ev.on('messages.upsert', (event) => {
      const messageWithButtons = event.messages.filter((message) => message.message?.buttonsResponseMessage);
      if (event.type === 'notify' && messageWithButtons.length > 0) {
        messageWithButtons.forEach((message) => {
          callback({
            from: message.key.remoteJid,
            selectedButtonId: message.message.buttonsResponseMessage.selectedButtonId,
          });
        });
      }
    });
  }

  async init() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      msgRetryCounterMap: retryMap,
    });

    this.socket.ev.process(async (event) => {
      if (event['connection.update']) {
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
      if (event['creds.update']) {
        await saveCreds();
      }
    });

    await this.socket.waitForSocketOpen();

    this.initStoreHandler();
  }

  async status() {
    const timeout = setTimeout(() => {
      throw new Error('timeout');
    }, 5_000);
    const blockList = await this.socket.fetchBlocklist();
    clearTimeout(timeout);
    return { ok: true, blockList };
  }

  private async initStoreHandler() {
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
      this.redis.set(STORE_KEY, data);
    }, 10_000);

    this.store.bind(this.socket.ev);
  }
}
