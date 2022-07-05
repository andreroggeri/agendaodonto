import { IDentistResponse } from './dentist.model';

export interface IClinicResponse {
    id: number;
    name: string;
    dentists: IDentistResponse[];
}
