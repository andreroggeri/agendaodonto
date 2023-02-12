import * as messages from './messages';
import { Messenger } from './messaging/messenger';

export enum ConversationState {
  GatheringAmilCard = 'GatheringAmilCard',
  GatheringInterondontoCard = 'GatheringInterodontoCard',
  Final = 'Final',
  ButtonFlow = 'ButtonFlow',
}
export interface WhatsappButton {
  text: string;
  nextFlow: FlowName;
}

export interface WhatsappChatFlow {
  message: string;
  buttons: WhatsappButton[];
  state: ConversationState;
  execute?: (messenger: Messenger) => Promise<void>;
}

export type FlowName =
  | 'scheduleSuccesFlow'
  | 'querySchedulePeriod'
  | 'finishFlow'
  | 'privateScheduleFlow'
  | 'patientUnderMinimumAge'
  | 'queryPatientAgeAmil'
  | 'queryPatientAgeInterodonto'
  | 'dentalPlanFlow'
  | 'scheduleAppointment'
  | 'informationFlow'
  | 'initialFlow'
  | 'queryAmilInsuranceCard'
  | 'queryInterodontoInsuranceCard'
  | 'queryAmilSchedulePeriod'
  | 'queryInterodontoSchedulePeriod';

function buildFlows(): Record<FlowName, WhatsappChatFlow> {
  const flows: Partial<Record<FlowName, WhatsappChatFlow>> = {
    queryAmilInsuranceCard: {
      message: messages.queryInsuranceCard,
      buttons: [],
      state: ConversationState.GatheringAmilCard,
    },
    queryInterodontoInsuranceCard: {
      message: messages.queryInsuranceCard,
      buttons: [],
      state: ConversationState.GatheringInterondontoCard,
    },
    scheduleSuccesFlow: {
      message: messages.scheduleSuccessFlowEnded,
      buttons: [],
      state: ConversationState.Final,
    },
    finishFlow: {
      message: messages.flowEnded,
      buttons: [],
      state: ConversationState.Final,
    },
  };

  flows.querySchedulePeriod = {
    message: messages.querySchedulePeriod,
    buttons: [
      { text: 'Manhã', nextFlow: 'scheduleSuccesFlow' },
      { text: 'Tarde', nextFlow: 'scheduleSuccesFlow' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.queryAmilSchedulePeriod = {
    message: messages.querySchedulePeriod,
    buttons: [
      { text: 'Manhã', nextFlow: 'queryAmilInsuranceCard' },
      { text: 'Tarde', nextFlow: 'queryAmilInsuranceCard' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.queryInterodontoSchedulePeriod = {
    message: messages.querySchedulePeriod,
    buttons: [
      { text: 'Manhã', nextFlow: 'queryInterodontoInsuranceCard' },
      { text: 'Tarde', nextFlow: 'queryInterodontoInsuranceCard' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.privateScheduleFlow = {
    message: messages.privateScheduleInformation,
    buttons: [
      { text: 'Sim', nextFlow: 'querySchedulePeriod' },
      { text: 'Não', nextFlow: 'finishFlow' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.patientUnderMinimumAge = {
    message: messages.patientUnderMinimumRequiredAge,
    buttons: [],
    state: ConversationState.Final,
  };

  flows.queryPatientAgeAmil = {
    message: messages.queryPatientAge,
    buttons: [
      { text: '0 a 8 anos', nextFlow: 'patientUnderMinimumAge' },
      { text: '9 a 18 anos', nextFlow: 'queryAmilSchedulePeriod' },
      { text: '18 anos ou mais', nextFlow: 'queryAmilSchedulePeriod' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.queryPatientAgeInterodonto = {
    message: messages.queryPatientAge,
    buttons: [
      { text: '0 a 10 anos', nextFlow: 'patientUnderMinimumAge' },
      { text: '11 a 18 anos', nextFlow: 'queryInterodontoSchedulePeriod' },
      { text: '18 anos ou mais', nextFlow: 'queryInterodontoSchedulePeriod' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.dentalPlanFlow = {
    message: messages.queryDentalPlan,
    buttons: [
      { text: 'Amil Dental', nextFlow: 'queryPatientAgeAmil' },
      { text: 'Interodonto', nextFlow: 'queryPatientAgeInterodonto' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.scheduleAppointment = {
    message: messages.queryTypeOfSchedule,
    buttons: [
      { text: 'Particular', nextFlow: 'privateScheduleFlow' },
      { text: 'Convênio odontológico', nextFlow: 'dentalPlanFlow' },
    ],
    state: ConversationState.ButtonFlow,
  };

  flows.informationFlow = {
    message: messages.informationMessage,
    buttons: [{ text: 'Agendamento', nextFlow: 'scheduleAppointment' }],
    state: ConversationState.ButtonFlow,
  };

  flows.initialFlow = {
    message: messages.initialGreetingMessage,
    buttons: [
      { text: 'Agendamento', nextFlow: 'scheduleAppointment' },
      { text: 'Informações', nextFlow: 'informationFlow' },
    ],
    state: ConversationState.ButtonFlow,
  };

  return flows as Record<FlowName, WhatsappChatFlow>;
}

export const flows = buildFlows();

export async function runFlow(flowName: FlowName, client: Messenger, to: string) {
  console.log('Running flow', flowName);
  const flow = flows[flowName];
  if (flow.buttons.length > 0) {
    await client.sendButtons(to, flow.message, flow.buttons);
  } else {
    await client.sendMessage(to, flow.message);
  }
}
