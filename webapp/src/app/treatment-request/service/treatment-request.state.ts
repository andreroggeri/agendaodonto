import { Injectable } from '@angular/core';
import { PageEvent } from '@angular/material';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PatientService } from 'src/app/patient/patient.service';
import { IPatientResponse } from 'src/app/shared/interfaces/services/patient.model';
import {
    ITreatmentRequestResponse,
    TreatmentRequestStatus,
} from 'src/app/shared/interfaces/services/treatment-request.response';
import { BaseFilter } from 'src/app/shared/services/base.filter';
import { TreatmentRequestService } from 'src/app/treatment-request/service/treatment-request.service';

export interface ITreatmentRequestRow {
    loading: boolean;
    data: ITreatmentRequestResponse;
}
interface ITreatmentRequestState {
    loading: boolean;
    error: boolean;
    treatmentRequests: ITreatmentRequestRow[];
    count: number;
}

export const initialState = {
    loading: false,
    error: false,
    treatmentRequests: [] as ITreatmentRequestRow[],
    count: 0,
};

function observe<T>(
    state: Observable<T>,
    prop: keyof T,
): Observable<T[keyof T]> {
    return state.pipe(map((s) => s[prop]));
}

@Injectable()
export class TreatmentRequestStateService {
    private state: BehaviorSubject<ITreatmentRequestState> =
        new BehaviorSubject(initialState);

    state$ = this.state.pipe();

    private get current() {
        return this.state.getValue();
    }

    constructor(
        private service: TreatmentRequestService,
        private patientService: PatientService,
    ) {}

    getState() {
        return this.state.pipe();
    }

    fetchTreatmentRequests(filter?: BaseFilter) {
        this.state.next({
            ...this.current,
            loading: true,
            error: false,
        });

        this.service
            .list(filter)
            .pipe(
                catchError(() => {
                    this.state.next({
                        ...this.current,
                        error: true,
                    });
                    return of({
                        results: [] as ITreatmentRequestResponse[],
                        count: 0,
                    });
                }),
            )
            .subscribe((response) => {
                this.state.next({
                    ...this.current,
                    loading: false,
                    count: response.count,
                    treatmentRequests: response.results.map((r) => {
                        return {
                            loading: false,
                            data: r,
                        };
                    }),
                });
            });
    }

    updateTreatmentRequest(
        row: ITreatmentRequestRow,
        status: TreatmentRequestStatus,
    ) {
        const foundIdx = this.current.treatmentRequests.findIndex(
            (r) => r === row,
        );

        if (foundIdx < 0) {
            console.warn('Treatment request not found');
            return;
        }

        const updated = [...this.current.treatmentRequests];
        updated[foundIdx] = {
            ...row,
            loading: true,
        };

        this.state.next({
            ...this.current,
            treatmentRequests: [...updated],
        });

        const data: ITreatmentRequestResponse = {
            ...row.data,
            status,
        };
        this.service
            .update(data)
            .pipe(
                catchError(() => {
                    return of(row.data);
                }),
            )
            .subscribe((response) => {
                updated[foundIdx] = {
                    loading: false,
                    data: response,
                };
                this.state.next({
                    ...this.current,
                    treatmentRequests: [...updated],
                });
            });
    }

    createPatientFromTreatmentRequest(row: ITreatmentRequestRow) {
        const foundIdx = this.current.treatmentRequests.findIndex(
            (r) => r === row,
        );
        if (foundIdx < 0) {
            return;
        }
        const updated = [...this.current.treatmentRequests];
        updated[foundIdx] = {
            ...row,
            loading: true,
        };
        this.state.next({
            ...this.current,
            treatmentRequests: [...updated],
        });
        const patient: IPatientResponse = {
            id: 0,
            name: row.data.patient_first_name,
            last_name: row.data.patient_last_name,
            sex: row.data.patient_gender,
            phone: row.data.patient_phone,
            clinic: {
                id: row.data.clinic,
                dentists: [],
                name: '',
            },
            dental_plan: {
                name: '',
                id: row.data.dental_plan,
            },
            dental_plan_card_number: row.data.dental_plan_card_number,
        };
        this.patientService.create(patient).subscribe(
            (_) => {
                this.updateTreatmentRequest(
                    this.current.treatmentRequests[foundIdx],
                    TreatmentRequestStatus.READY,
                );
            },
            (err) => {
                updated[foundIdx] = {
                    ...row,
                    loading: false,
                };
                this.state.next({
                    ...this.current,
                    treatmentRequests: [...updated],
                });
            },
        );
    }

    mergePatient(row: ITreatmentRequestRow, patient: IPatientResponse) {
        const foundIdx = this.current.treatmentRequests.findIndex(
            (r) => r === row,
        );
        if (foundIdx < 0) {
            return;
        }
        const updated = [...this.current.treatmentRequests];
        updated[foundIdx] = {
            ...row,
            loading: true,
        };
        this.state.next({
            ...this.current,
            treatmentRequests: [...updated],
        });
        const updatedPatient = {
            ...patient,
            name: row.data.patient_first_name,
            last_name: row.data.patient_last_name,
            phone: row.data.patient_phone,
            dental_plan_card_number: row.data.dental_plan_card_number,
        };
        this.patientService.update(updatedPatient).subscribe(
            (_) => {
                this.updateTreatmentRequest(
                    this.current.treatmentRequests[foundIdx],
                    TreatmentRequestStatus.READY,
                );
            },
            (err) => {
                updated[foundIdx] = {
                    ...row,
                    loading: false,
                };
                this.state.next({
                    ...this.current,
                    treatmentRequests: [...updated],
                });
            },
        );
    }

    paginate(event: PageEvent) {
        const offset = event.pageIndex * event.pageSize;
        const filter = new BaseFilter();
        filter.setFilterValue('pageSize', event.pageSize.toString());
        filter.setFilterValue('offset', offset.toString());

        this.fetchTreatmentRequests(filter);
    }
}
