import { Buttons, Client, Message } from "whatsapp-web.js";
import * as messages from "./messages";

interface WhatsappButton {
    text: string;
    nextFlow: WhatsappChatFlow
}

export interface WhatsappChatFlow {
    message: string;
    buttons: WhatsappButton[];
}

const queryInsuranceCard: WhatsappChatFlow = {
    message: messages.queryInsuranceCard,
    buttons: []
}

const scheduleSuccesFlow: WhatsappChatFlow = {
    message: messages.scheduleSuccessFlowEnded,
    buttons: []
}

const querySchedulePeriod: WhatsappChatFlow = {
    message: messages.querySchedulePeriod,
    buttons: [
        { text: 'Manhã', nextFlow: scheduleSuccesFlow },
        { text: 'Tarde', nextFlow: scheduleSuccesFlow }
    ]
}

const queryInsuranceSchedulePeriod: WhatsappChatFlow = {
    message: messages.querySchedulePeriod,
    buttons: [
        { text: 'Manhã', nextFlow: queryInsuranceCard },
        { text: 'Tarde', nextFlow: queryInsuranceCard }
    ]
}

const finishFlow: WhatsappChatFlow = {
    message: messages.flowEnded,
    buttons: []
}

const privateScheduleFlow: WhatsappChatFlow = {
    message: messages.privateScheduleInformation,
    buttons: [
        { text: 'Sim', nextFlow: querySchedulePeriod },
        { text: 'Não', nextFlow: finishFlow }
    ]
}

const patientUnderMinimumAge: WhatsappChatFlow = {
    message: messages.patientUnderMinimumRequiredAge,
    buttons: []
}

const queryPatientAge: WhatsappChatFlow = {
    message: messages.queryPatientAge,
    buttons: [
        { text: '0 a 8 anos', nextFlow: patientUnderMinimumAge },
        { text: '9 a 18 anos', nextFlow: queryInsuranceSchedulePeriod },
        { text: '18 anos ou mais', nextFlow: queryInsuranceSchedulePeriod },
    ]
}

const dentalPlanFlow: WhatsappChatFlow = {
    message: messages.queryDentalPlan,
    buttons: [
        { text: 'Amil Dental', nextFlow: queryPatientAge },
        { text: 'Interodonto', nextFlow: queryPatientAge }
    ]
}

const scheduleAppointment: WhatsappChatFlow = {
    message: messages.queryTypeOfSchedule,
    buttons: [
        { text: 'Particular', nextFlow: privateScheduleFlow },
        { text: 'Convênio odontológico', nextFlow: dentalPlanFlow }
    ]
}

const informationFlow: WhatsappChatFlow = {
    message: messages.informationMessage,
    buttons: [
        { text: 'Agendamento', nextFlow: scheduleAppointment }
    ]
}

export const initialFlow: WhatsappChatFlow = {
    message: messages.initialGreetingMessage,
    buttons: [
        { text: 'Agendamento', nextFlow: scheduleAppointment },
        { text: 'Informações', nextFlow: informationFlow }
    ]
}

export function runFlow(flow: WhatsappChatFlow, client: Client, message: Message) {
    console.log('Running flow', flow)
    if (flow.buttons.length > 0) {
        const buttons = flow.buttons.map(button => {
            return { body: button.text }
        });
        const messageBody = new Buttons(flow.message, buttons as any)
        console.log('Message body', messageBody)
        client.sendMessage(message.from, messageBody, { sendSeen: false })
    } else {
        client.sendMessage(message.from, flow.message, { sendSeen: false })
    }
}