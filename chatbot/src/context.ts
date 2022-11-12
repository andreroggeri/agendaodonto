import { differenceInHours } from 'date-fns';
import * as flows from './buttons';
import { WhatsappChatFlow } from './buttons';
import { redis } from './redis';

class ClientContext {
  constructor(private readonly author: string, private currentFlow: WhatsappChatFlow, private lastInteraction?: Date) {}

  get isLastInteractionTooOld(): boolean {
    if (!this.lastInteraction) {
      return true;
    }
    const diff = differenceInHours(new Date(), this.lastInteraction) > 12;
    return diff;
  }

  static fromObject(author: string, data: ClientContext): ClientContext {
    return new ClientContext(
      author,
      data.currentFlow,
      data.lastInteraction ? new Date(data.lastInteraction) : new Date(),
    );
  }

  setCurrentFlow(flow: WhatsappChatFlow) {
    this.lastInteraction = new Date();
    this.currentFlow = flow;
  }

  getCurrentFlow(): WhatsappChatFlow {
    return this.currentFlow;
  }

  async saveContext() {
    const content = JSON.stringify(this);
    await redis.set(this.author, content);
  }
}

export async function loadContext(messageAuthor: string): Promise<ClientContext> {
  const data = await redis.get(messageAuthor);
  if (data) {
    return ClientContext.fromObject(messageAuthor, JSON.parse(data));
  }

  return new ClientContext(messageAuthor, flows.initialFlow);
}
