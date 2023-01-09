export enum TreatmentRequestStatus {
    PENDING = 'PENDING',
    DATA_FETCHED_NEW_PATIENT = 'DATA_FETCHED_NEW_PATIENT',
    DATA_FETCH_FAIL = 'DATA_FETCH_FAIL',
    READY = 'READY',
    CANCELED = 'CANCELED',
    SUBMITTING = 'SUBMITTING',
    SUBMITTED = 'SUBMITTED',
    SUBMIT_FAIL = 'SUBMIT_FAIL',
}

export interface ITreatmentRequestResponse {
    id: number;
    dental_plan_card_number: string;
    dental_plan: number;
    patient_phone: string;
    dentist_phone: string;
    status: TreatmentRequestStatus;
    patient_first_name: string;
    patient_last_name: string;
    patient_birth_date: string;
    patient_gender: string;
    clinic: number;
}
