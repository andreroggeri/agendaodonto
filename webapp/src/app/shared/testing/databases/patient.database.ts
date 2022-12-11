import { randFirstName, randLastName, randPhoneNumber } from '@ngneat/falso';
import { IPatientResponse } from '../../interfaces/services/patient.model';
import { BaseDatabase } from './base.database';
import { ClinicDatabase } from './clinic.database';
import { DentalPlanDatabase } from './dental-plan.database';

export class PatientDatabase extends BaseDatabase<IPatientResponse> {
    clinicDatabase = new ClinicDatabase();
    dentalPlanDatabase = new DentalPlanDatabase();

    get(): IPatientResponse {
        const patient: IPatientResponse = {
            id: Math.floor(Math.random() * 100 + 1),
            name: randFirstName(),
            last_name: randLastName(),
            sex: 'M',
            phone: randPhoneNumber(),
            clinic: this.clinicDatabase.get(),
            dental_plan: this.dentalPlanDatabase.get(),
        };
        return patient;
    }
}
