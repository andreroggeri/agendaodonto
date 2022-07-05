import { IClinicResponse } from './clinic.model';
import { IDentalPlanResponse } from './denta-plan.model';

export interface IPatientResponse {
    id: number;
    name: string;
    last_name: string;
    sex: string;
    phone: string;
    clinic: IClinicResponse;
    dental_plan: IDentalPlanResponse;
}
