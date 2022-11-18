import { randFirstName } from '@ngneat/falso';
import { IClinicResponse } from '../../interfaces/services/clinic.model';
import { BaseDatabase } from './base.database';
import { DentistDatabase } from './dentist.database';

export class ClinicDatabase extends BaseDatabase<IClinicResponse> {

    dentistDabase = new DentistDatabase();

    get(): IClinicResponse {
        const clinic: IClinicResponse = {
            id: Math.floor((Math.random() * 100) + 1),
            name: randFirstName(),
            dentists: this.dentistDabase.getMany(Math.floor(Math.random() * 10) + 1),
        };
        return clinic;
    }

}
