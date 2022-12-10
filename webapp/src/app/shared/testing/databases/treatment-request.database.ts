import {
    rand,
    randFirstName,
    randLastName,
    randNumber,
    randPastDate,
    randPhoneNumber,
} from '@ngneat/falso';
import {
    ITreatmentRequestResponse,
    TreatmentRequestStatus,
} from 'src/app/shared/interfaces/services/treatment-request.response';

import { BaseDatabase } from './base.database';

export class TreatmentRequestDatabase extends BaseDatabase<ITreatmentRequestResponse> {
    get() {
        return {
            id: randNumber(),
            dental_plan_card_number: randNumber().toString(),
            dental_plan: randNumber(),
            patient_phone: randPhoneNumber(),
            dentist_phone: randPhoneNumber(),
            status: rand(Object.values(TreatmentRequestStatus)),
            clinic: randNumber(),
            patient_first_name: randFirstName(),
            patient_last_name: randLastName(),
            patient_birth_date: randPastDate().toISOString(),
            patient_gender: rand(['M', 'F']),
        };
    }
}
