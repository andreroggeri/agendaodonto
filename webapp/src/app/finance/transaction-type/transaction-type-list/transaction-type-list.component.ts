import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ITransactionTypeState } from '../../shared/models/transaction-type.state';
import { loadTransactionTypeDetail, transactionTypesPageChanged } from '../../store/actions/transaction-type.actions';

@Component({
    selector: 'app-transaction-type-list',
    templateUrl: './transaction-type-list.component.html',
})
export class TransactionTypeListComponent {
    state$ = this.store.select(m => m.finance.transactionTypes);
    empty$ = this.state$.pipe(map(v => v.transactionTypes.empty));
    error$ = this.state$.pipe(map(v => v.transactionTypes.error));
    loading$ = this.state$.pipe(map(v => v.transactionTypes.loading));
    hasResult$ = this.state$.pipe(map(v => !v.transactionTypes.empty && !v.transactionTypes.error && !v.transactionTypes.loading));
    count$ = this.state$.pipe(map(v => v.transactionTypes.count));

    rows$ = this.state$.pipe(map(v => v.transactionTypes.all));

    subscription: Subscription;

    displayedColumns = ['code', 'label'];
    @ViewChild(MatPaginator, { static: false })
    set paginator(paginator: MatPaginator) {
        if (paginator) {
            if (this.subscription) {
                this.subscription.unsubscribe();
            }
            this.subscription = paginator.page.subscribe((pageEvent: PageEvent) => {
                this.store.dispatch(transactionTypesPageChanged({ event: pageEvent }));
            });
        }

    }

    constructor(
        private readonly store: Store<{ finance: { transactionTypes: ITransactionTypeState } }>,
    ) { }

    viewTransactionType(transactionTypeId: number) {
        this.store.dispatch(loadTransactionTypeDetail({ transactionTypeId }));
    }
}
