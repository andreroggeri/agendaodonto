import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientLookupComponent } from 'src/app/shared/components/patient-lookup/patient-lookup.component';
import { IPatientResponse } from 'src/app/shared/interfaces/services/patient.model';
import { TreatmentRequestStatus } from 'src/app/shared/interfaces/services/treatment-request.response';
import {
    ITreatmentRequestRow,
    TreatmentRequestStateService,
} from 'src/app/treatment-request/service/treatment-request.state';

const labelMap: Record<TreatmentRequestStatus, string> = {
    [TreatmentRequestStatus.PENDING]: 'Buscando dados',
    [TreatmentRequestStatus.DATA_FETCHED_NEW_PATIENT]: 'Paciente novo',
    [TreatmentRequestStatus.DATA_FETCH_FAIL]: 'Erro ao buscar os dados',
    [TreatmentRequestStatus.READY]: 'Aguardando solicitação de tratamento',
    [TreatmentRequestStatus.CANCELED]: 'Solicitação cancelada',
    [TreatmentRequestStatus.SUBMITTED]: 'Tratamento solicitado com sucesso',
    [TreatmentRequestStatus.SUBMITTING]: 'Solicitando tratamento',
    [TreatmentRequestStatus.SUBMIT_FAIL]: 'Erro ao solicitar tratamento',
};

@Component({
    selector: 'app-treatment-request',
    templateUrl: './treatment-request.component.html',
    styleUrls: ['./treatment-request.component.scss'],
})
export class TreatmentRequestComponent implements OnInit {
    readonly columnsToDisplay = [
        'cardNumber',
        'patientPhone',
        'patientFirstName',
        'patientLastName',
        'status',
        'actions',
    ];

    constructor(
        private state: TreatmentRequestStateService,
        private dialog: MatDialog,
    ) {}

    rows$ = this.state.getState().pipe(map((state) => state.treatmentRequests));
    error$ = this.state.getState().pipe(map((state) => state.error));
    loading$ = this.state.getState().pipe(map((state) => state.loading));
    rowCount$ = this.state.getState().pipe(map((state) => state.count));
    empty$ = this.state
        .getState()
        .pipe(
            map(
                (state) =>
                    state.treatmentRequests.length === 0 &&
                    !state.loading &&
                    !state.error,
            ),
        );

    paginateSubscription: Subscription;

    @ViewChild(MatPaginator, { static: false })
    set paginator(paginator: MatPaginator) {
        if (paginator) {
            if (this.paginateSubscription) {
                this.paginateSubscription.unsubscribe();
            }
            this.paginateSubscription = paginator.page.subscribe(
                (pageEvent: PageEvent) => {
                    this.state.paginate(pageEvent);
                },
            );
        }
    }

    ngOnInit() {
        this.state.fetchTreatmentRequests();
    }

    cancelRequest(row: ITreatmentRequestRow) {
        this.state.updateTreatmentRequest(row, TreatmentRequestStatus.CANCELED);
    }

    createNewPatient(row: ITreatmentRequestRow) {
        this.state.createPatientFromTreatmentRequest(row);
    }

    mergePatient(treatmentRequest: ITreatmentRequestRow) {
        const ref = this.dialog.open(PatientLookupComponent, {
            data: {
                treatmentRequest,
            },
        });
        ref.afterClosed().subscribe((patient: IPatientResponse) => {
            if (patient) {
                this.state.mergePatient(treatmentRequest, patient);
            }
        });
    }

    requestTreatment(row: ITreatmentRequestRow) {
        this.state.requestTreatment(row);
    }

    buttonStateForStatus(action: string, row: ITreatmentRequestRow): boolean {
        const statusMap: Record<TreatmentRequestStatus, string[]> = {
            [TreatmentRequestStatus.PENDING]: ['cancel'],
            [TreatmentRequestStatus.DATA_FETCHED_NEW_PATIENT]: [
                'cancel',
                'create_new_patient',
                'merge_patient',
            ],
            [TreatmentRequestStatus.DATA_FETCH_FAIL]: [],
            [TreatmentRequestStatus.READY]: ['cancel', 'request_treatment'], // TODO: Should be 'cancel', 'request_treatment' but we don't have the endpoint yet
            [TreatmentRequestStatus.CANCELED]: [],
            [TreatmentRequestStatus.SUBMITTED]: [],
            [TreatmentRequestStatus.SUBMITTING]: ['cancel'],
            [TreatmentRequestStatus.SUBMIT_FAIL]: [],
        };
        return row.loading || !statusMap[row.data.status].includes(action);
    }

    getLabelForStatus(status: TreatmentRequestStatus): string {
        return labelMap[status];
    }
}
