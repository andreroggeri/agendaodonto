import * as faker from 'faker/locale/pt_BR';

import { IDentistResponse } from '../../interfaces/services/dentist.model';
import { BaseDatabase } from './base.database';

export class DentistDatabase extends BaseDatabase<IDentistResponse> {

    get(): IDentistResponse {
        const cro = Math.floor((Math.random() * 10000) + 1);
        const dentist: IDentistResponse = {
            id: Math.floor((Math.random() * 100) + 1),
            cro: cro.toString(),
            cro_state: 'SP',
            first_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            email: faker.internet.email(),
            sex: 'M',
        };
        return dentist;
    }

}
