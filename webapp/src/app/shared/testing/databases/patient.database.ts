import * as faker from 'faker/locale/pt_BR';

import { IPatientResponse } from '../../interfaces/services/patient.model';
import { BaseDatabase } from './base.database';
import { ClinicDatabase } from './clinic.database';
import { DentalPlanDatabase } from './dental-plan.database';

export class PatientDatabase extends BaseDatabase<IPatientResponse> {

    clinicDatabase = new ClinicDatabase();
    dentalPlanDatabase = new DentalPlanDatabase();

    get(): IPatientResponse {
        const patient: IPatientResponse = {
            id: Math.floor((Math.random() * 100) + 1),
            name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            sex: 'M',
            phone: faker.phone.phoneNumber(),
            clinic: this.clinicDatabase.get(),
            dental_plan: this.dentalPlanDatabase.get(),
        };
        return patient;
    }

}
