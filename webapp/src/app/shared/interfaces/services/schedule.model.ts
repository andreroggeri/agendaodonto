import { IDentistResponse } from './dentist.model';
import { IPatientResponse } from './patient.model';

export interface IScheduleResponse {
    id: number;
    patient: IPatientResponse;
    dentist: IDentistResponse;
    date: string;
    duration: number;
    status: number;
    notification_status: string;
}
