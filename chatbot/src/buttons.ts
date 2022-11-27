import * as messages from './messages';
import { Messenger } from './messaging/messenger';

enum ConversationState {
  GatheringImage = 'GatheringImage',
  Final = 'Final',
  ButtonFlow = 'ButtonFlow',
}
export interface WhatsappButton {
  text: string;
  nextFlow: WhatsappChatFlow;
}

export interface WhatsappChatFlow {
  message: string;
  buttons: WhatsappButton[];
  state: ConversationState;
}

const queryInsuranceCard: WhatsappChatFlow = {
  message: messages.queryInsuranceCard,
  buttons: [],
  state: ConversationState.GatheringImage,
};

const scheduleSuccesFlow: WhatsappChatFlow = {
  message: messages.scheduleSuccessFlowEnded,
  buttons: [],
  state: ConversationState.Final,
};

const querySchedulePeriod: WhatsappChatFlow = {
  message: messages.querySchedulePeriod,
  buttons: [
    { text: 'Manhã', nextFlow: scheduleSuccesFlow },
    { text: 'Tarde', nextFlow: scheduleSuccesFlow },
  ],
  state: ConversationState.ButtonFlow,
};

const queryInsuranceSchedulePeriod: WhatsappChatFlow = {
  message: messages.querySchedulePeriod,
  buttons: [
    { text: 'Manhã', nextFlow: queryInsuranceCard },
    { text: 'Tarde', nextFlow: queryInsuranceCard },
  ],
  state: ConversationState.ButtonFlow,
};

export const finishFlow: WhatsappChatFlow = {
  message: messages.flowEnded,
  buttons: [],
  state: ConversationState.Final,
};

const privateScheduleFlow: WhatsappChatFlow = {
  message: messages.privateScheduleInformation,
  buttons: [
    { text: 'Sim', nextFlow: querySchedulePeriod },
    { text: 'Não', nextFlow: finishFlow },
  ],
  state: ConversationState.ButtonFlow,
};

const patientUnderMinimumAge: WhatsappChatFlow = {
  message: messages.patientUnderMinimumRequiredAge,
  buttons: [],
  state: ConversationState.Final,
};

const queryPatientAge: WhatsappChatFlow = {
  message: messages.queryPatientAge,
  buttons: [
    { text: '0 a 8 anos', nextFlow: patientUnderMinimumAge },
    { text: '9 a 18 anos', nextFlow: queryInsuranceSchedulePeriod },
    { text: '18 anos ou mais', nextFlow: queryInsuranceSchedulePeriod },
  ],
  state: ConversationState.ButtonFlow,
};

const queryPatientAgeInterodonto: WhatsappChatFlow = {
  message: messages.queryPatientAge,
  buttons: [
    { text: '0 a 10 anos', nextFlow: patientUnderMinimumAge },
    { text: '11 a 18 anos', nextFlow: queryInsuranceSchedulePeriod },
    { text: '18 anos ou mais', nextFlow: queryInsuranceSchedulePeriod },
  ],
  state: ConversationState.ButtonFlow,
};

const dentalPlanFlow: WhatsappChatFlow = {
  message: messages.queryDentalPlan,
  buttons: [
    { text: 'Amil Dental', nextFlow: queryPatientAge },
    { text: 'Interodonto', nextFlow: queryPatientAgeInterodonto },
  ],
  state: ConversationState.ButtonFlow,
};

const scheduleAppointment: WhatsappChatFlow = {
  message: messages.queryTypeOfSchedule,
  buttons: [
    { text: 'Particular', nextFlow: privateScheduleFlow },
    { text: 'Convênio odontológico', nextFlow: dentalPlanFlow },
  ],
  state: ConversationState.ButtonFlow,
};

const informationFlow: WhatsappChatFlow = {
  message: messages.informationMessage,
  buttons: [{ text: 'Agendamento', nextFlow: scheduleAppointment }],
  state: ConversationState.ButtonFlow,
};

export const initialFlow: WhatsappChatFlow = {
  message: messages.initialGreetingMessage,
  buttons: [
    { text: 'Agendamento', nextFlow: scheduleAppointment },
    { text: 'Informações', nextFlow: informationFlow },
  ],
  state: ConversationState.ButtonFlow,
};

export function runFlow(flow: WhatsappChatFlow, client: Messenger, to: string) {
  console.log('Running flow', flow);
  if (flow.buttons.length > 0) {
    client.sendButtons(to, flow.message, flow.buttons);
  } else {
    client.sendMessage(to, flow.message);
  }
}
