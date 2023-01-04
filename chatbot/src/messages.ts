import { utcToZonedTime } from 'date-fns-tz';

export function currentTimeGreeting(): string {
  console.log('generating current time')
  const now = new Date();
  const zonedTime = utcToZonedTime(now, 'America/Sao_Paulo');

  const currentHour = zonedTime.getHours();

  if (currentHour >= 8 && currentHour <= 12) {
    return 'Bom dia';
  } else if (currentHour > 12 && currentHour <= 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

// TODO: Handle dynamic messages
// export const initialGreetingMessage =  `${currentTimeGreeting()}, tudo bem ?\n\nVocê está falando com o Consultório Odontológico Dra. Luana Elisa Doretto\n\nEm que posso ajudar ?`;

export const initialGreetingMessage = `Olá, tudo bem ?

Você está falando com o Consultório Odontológico Dra. Luana Elisa Doretto

Em que posso ajudar ?`;

export const informationMessage = `
*Horário de funcionamento:* 09:00 - 16:00
*Endereço:* Av. Adherbal da Costa Moreira, 589 - 1º andar, sala 3 (Fica na calçada do depósito Figueira Branca, em cima da loja Ltintas.)
*Tipos de atendimento:* Particular e convênios (Amil Dental e Interodonto)
*Especialidades:* Clinico Geral e Endodontia


Caso você queira alguma outra informação, basta deixar sua mensagem aqui e assim que possível te responderei.
`.trim();

export const queryTypeOfSchedule = 'Qual é o tipo do agendamento ?';

export const privateScheduleInformation = `
O valor da consulta de avaliação é R$50,00. Se iniciar o tratamento no dia da consulta, é cobrado somente o valor do tratamento.

Gostaria de agendar um horário?
`.trim();

export const queryDentalPlan = 'Qual o seu convênio odontológico ?';

export const patientUnderMinimumRequiredAge =
  'Pelo convênio só atendo clínico geral básico (como limpeza e restauração) em pacientes adultos.\n\nNão sou credenciada para atendimento odontopediatrico pelo convênio.';

export const queryPatientAge = 'Qual a idade do paciente ?';

export const querySchedulePeriod = 'Qual o período que você deseja agendar ?';

export const flowEnded = 'Agradeço o contato.\nQualquer dúvida estou a disposição.';

export const scheduleSuccessFlowEnded =
  'Obrigada pelas informações.\n\nEm breve retornarei com os horários disponíveis.';

export const queryInsuranceCard =
  '*Por gentileza enviar a carteirinha do convênio.*\n\nApós a liberação do atendimento pelo convênio, retornarei com os horários disponíveis para realizarmos o agendamento.';
