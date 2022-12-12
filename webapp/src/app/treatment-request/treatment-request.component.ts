import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ITreatmentRequestResponse,
    TreatmentRequestStatus,
} from 'src/app/shared/interfaces/services/treatment-request.response';
import TreatmentRequestStateService, {
    ITreatmentRequestRow,
} from 'src/app/treatment-request/service/treatment-request.state';

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

    constructor(private state: TreatmentRequestStateService) {}

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

    mergePatient(treatmentRequest: ITreatmentRequestResponse) {}

    buttonStateForStatus(action: string, row: ITreatmentRequestRow): boolean {
        const statusMap: Record<TreatmentRequestStatus, string[]> = {
            [TreatmentRequestStatus.PENDING]: ['cancel'],
            [TreatmentRequestStatus.DATA_FETCHED_NEW_PATIENT]: [
                'cancel',
                'create_new_patient',
                'merge_patient',
            ],
            [TreatmentRequestStatus.DATA_FETCHED_KNOWN_PATIENT]: [
                'cancel',
                'request_treatment',
            ],
            [TreatmentRequestStatus.DATA_FETCH_FAIL]: [],
            [TreatmentRequestStatus.READY]: ['cancel', 'request_treatment'],
            [TreatmentRequestStatus.CANCELED]: [],
            [TreatmentRequestStatus.REQUESTED]: [],
        };
        return row.loading || !statusMap[row.data.status].includes(action);
    }
}
