import * as messages from './messages';
import { Messenger } from './messaging/messenger';

export interface WhatsappButton {
  text: string;
  nextFlow: WhatsappChatFlow;
}

export interface WhatsappChatFlow {
  message: string;
  buttons: WhatsappButton[];
}

const queryInsuranceCard: WhatsappChatFlow = {
  message: messages.queryInsuranceCard,
  buttons: [],
};

const scheduleSuccesFlow: WhatsappChatFlow = {
  message: messages.scheduleSuccessFlowEnded,
  buttons: [],
};

const querySchedulePeriod: WhatsappChatFlow = {
  message: messages.querySchedulePeriod,
  buttons: [
    { text: 'Manhã', nextFlow: scheduleSuccesFlow },
    { text: 'Tarde', nextFlow: scheduleSuccesFlow },
  ],
};

const queryInsuranceSchedulePeriod: WhatsappChatFlow = {
  message: messages.querySchedulePeriod,
  buttons: [
    { text: 'Manhã', nextFlow: queryInsuranceCard },
    { text: 'Tarde', nextFlow: queryInsuranceCard },
  ],
};

export const finishFlow: WhatsappChatFlow = {
  message: messages.flowEnded,
  buttons: [],
};

const privateScheduleFlow: WhatsappChatFlow = {
  message: messages.privateScheduleInformation,
  buttons: [
    { text: 'Sim', nextFlow: querySchedulePeriod },
    { text: 'Não', nextFlow: finishFlow },
  ],
};

const patientUnderMinimumAge: WhatsappChatFlow = {
  message: messages.patientUnderMinimumRequiredAge,
  buttons: [],
};

const queryPatientAge: WhatsappChatFlow = {
  message: messages.queryPatientAge,
  buttons: [
    { text: '0 a 8 anos', nextFlow: patientUnderMinimumAge },
    { text: '9 a 18 anos', nextFlow: queryInsuranceSchedulePeriod },
    { text: '18 anos ou mais', nextFlow: queryInsuranceSchedulePeriod },
  ],
};

const queryPatientAgeInterodonto: WhatsappChatFlow = {
  message: messages.queryPatientAge,
  buttons: [
    { text: '0 a 10 anos', nextFlow: patientUnderMinimumAge },
    { text: '11 a 18 anos', nextFlow: queryInsuranceSchedulePeriod },
    { text: '18 anos ou mais', nextFlow: queryInsuranceSchedulePeriod },
  ],
};

const dentalPlanFlow: WhatsappChatFlow = {
  message: messages.queryDentalPlan,
  buttons: [
    { text: 'Amil Dental', nextFlow: queryPatientAge },
    { text: 'Interodonto', nextFlow: queryPatientAgeInterodonto },
  ],
};

const scheduleAppointment: WhatsappChatFlow = {
  message: messages.queryTypeOfSchedule,
  buttons: [
    { text: 'Particular', nextFlow: privateScheduleFlow },
    { text: 'Convênio odontológico', nextFlow: dentalPlanFlow },
  ],
};

const informationFlow: WhatsappChatFlow = {
  message: messages.informationMessage,
  buttons: [{ text: 'Agendamento', nextFlow: scheduleAppointment }],
};

export const initialFlow: WhatsappChatFlow = {
  message: messages.initialGreetingMessage,
  buttons: [
    { text: 'Agendamento', nextFlow: scheduleAppointment },
    { text: 'Informações', nextFlow: informationFlow },
  ],
};

export function runFlow(flow: WhatsappChatFlow, client: Messenger, to: string) {
  console.log('Running flow', flow);
  if (flow.buttons.length > 0) {
    client.sendButtons(to, flow.message, flow.buttons);
  } else {
    client.sendMessage(to, flow.message);
  }
}
