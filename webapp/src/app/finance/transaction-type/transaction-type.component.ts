import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { ITransactionTypeState } from '../shared/models/transaction-type.state';
import { clinicSelected, loadClinics } from '../store/actions/transaction-type.actions';

@Component({
    selector: 'app-transaction-type',
    templateUrl: './transaction-type.component.html',
    styleUrls: ['./transaction-type.component.scss'],
})
export class TransactionTypeComponent implements OnInit {
    state$ = this.store.select(m => m.finance.transactionTypes);
    clinic$ = this.state$.pipe(
        filter(s => !s.clinic.error && !s.clinic.empty),
        map(v => v.clinic.all),
        distinctUntilChanged(),
    );
    selectedClinic$ = this.state$.pipe(map(s => s.clinic.selected));
    empty$ = this.state$.pipe(map(v => v.clinic.empty));
    error$ = this.state$.pipe(map(v => v.clinic.error));
    loading$ = this.state$.pipe(map(v => v.clinic.loading));
    hasClinics$ = this.state$.pipe(map(v => !v.clinic.empty && !v.clinic.error && !v.clinic.loading));

    constructor(private readonly store: Store<{ finance: { transactionTypes: ITransactionTypeState } }>) {
    }

    ngOnInit() {
        this.clinic$.subscribe(clinics => {
            if (clinics.length > 0) {
                this.store.dispatch(clinicSelected({ clinic: clinics[0] }));
            }
        });

        this.store.dispatch(loadClinics());
    }

    clinicSelected(change: MatSelectChange) {
        this.store.dispatch(clinicSelected({ clinic: change.value }));
    }

}
