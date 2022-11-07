import { differenceInHours } from 'date-fns';
import { WhatsappChatFlow } from './buttons';

export class ClientContext {
  constructor(private currentFlow: WhatsappChatFlow, private lastInteraction?: Date) {}

  get isLastInteractionTooOld(): boolean {
    if (!this.lastInteraction) {
      return true;
    }
    const diff = differenceInHours(new Date(), this.lastInteraction) > 12;
    return diff;
  }

  static fromObject(data: ClientContext): ClientContext {
    return new ClientContext(data.currentFlow, data.lastInteraction ? new Date(data.lastInteraction) : new Date());
  }

  setCurrentFlow(flow: WhatsappChatFlow) {
    this.lastInteraction = new Date();
    this.currentFlow = flow;
  }

  getCurrentFlow(): WhatsappChatFlow {
    return this.currentFlow;
  }
}
