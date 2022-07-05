import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPagedResponse } from 'src/app/shared/interceptors/responses';
import { ITransactionTypeResponse } from 'src/app/shared/interfaces/services/transaction-type-response.model';
import { BaseService } from 'src/app/shared/services/base.service';

import { TransactionTypeDomain } from '../models/transaction-type.domain';
import { TransactionTypeFilter } from './transaction-type.filter';

@Injectable()
export class TransactionTypeService extends BaseService {

    constructor(private readonly http: HttpClient) {
        super();
    }

    getAll(clinicId: number, filter?: TransactionTypeFilter): Observable<IPagedResponse<TransactionTypeDomain>> {
        const url = this.url(['finance/transaction-types', clinicId]);
        const params = filter ? filter.getFilter() : new TransactionTypeFilter().getFilter();

        return this.http.get<IPagedResponse<ITransactionTypeResponse>>(url, params).pipe(
            map(response => {
                return {
                    results: response.results.map(TransactionTypeDomain.fromResponse),
                    count: response.count,
                };
            }),
        );
    }

    get(clinicId: number, transactionId: number): Observable<TransactionTypeDomain> {
        const url = this.url(['finance/transaction-types', clinicId, transactionId]);

        return this.http.get<ITransactionTypeResponse>(url).pipe(map(TransactionTypeDomain.fromResponse));
    }

    delete(clinicId: number, transactionId: number): Observable<void> {
        const url = this.url(['finance/transaction-types', clinicId, transactionId]);

        return this.http.delete<void>(url);
    }

    create(clinicId: number, transactionType: TransactionTypeDomain): Observable<void> {
        const url = this.url(['finance/transaction-types', clinicId]);

        return this.http.post<void>(url, transactionType);
    }

    update(clinicId: number, transactionType: TransactionTypeDomain): Observable<void> {
        const url = this.url(['finance/transaction-types', clinicId, transactionType.id]);

        return this.http.put<void>(url, transactionType);
    }

    save(clinicId: number, transactionType: TransactionTypeDomain): Observable<void> {
        if (transactionType.id) {
            return this.update(clinicId, transactionType);
        } else {
            return this.create(clinicId, transactionType);
        }
    }

}
