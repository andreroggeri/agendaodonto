import { differenceInHours } from 'date-fns';
import { FlowName, flows, WhatsappChatFlow } from './buttons';
import { redis } from './redis';

interface SavedState {
  from: string;
  flowName: string;
  lastInteraction: number;
}

class ClientContext {
  constructor(
    private readonly author: string,
    private currentFlow: WhatsappChatFlow,
    private flowName: FlowName,
    private lastInteraction?: Date,
  ) {}

  get isLastInteractionTooOld(): boolean {
    if (!this.lastInteraction) {
      return true;
    }
    const diff = differenceInHours(new Date(), this.lastInteraction) > 12;
    return diff;
  }

  static fromObject(data: SavedState): ClientContext {
    const currentFlowKey = (Object.keys(flows).find((k) => k === data.flowName) as FlowName) || 'initialFlow';
    const flow = flows[currentFlowKey];
    return new ClientContext(data.from, flow, currentFlowKey, new Date(data.lastInteraction));
  }

  setCurrentFlow(flow: FlowName) {
    this.lastInteraction = new Date();
    this.currentFlow = flows[flow];
    this.flowName = flow;
  }

  getCurrentFlow(): WhatsappChatFlow {
    return this.currentFlow;
  }

  async save() {
    const data: SavedState = {
      from: this.author,
      flowName: this.flowName,
      lastInteraction: this.lastInteraction?.getTime() ?? 0,
    };
    await redis.set(this.author, JSON.stringify(data));
  }

  async reset() {
    await redis.del(this.author);
  }
}

export async function loadContext(messageAuthor: string): Promise<ClientContext> {
  const data = await redis.get(messageAuthor);
  if (data) {
    return ClientContext.fromObject(JSON.parse(data));
  }

  return new ClientContext(messageAuthor, flows.initialFlow, 'initialFlow');
}
