import { IClinicResponse } from 'src/app/shared/interfaces/services/clinic.model';
import { TransactionTypeDomain } from './transaction-type.domain';

export interface ITransactionTypeState {
    clinic: {
        all: IClinicResponse[];
        selected?: IClinicResponse;
        loading: boolean;
        error: boolean;
        empty: boolean;
    };
    transactionTypes: {
        all: TransactionTypeDomain[];
        count: number;
        loading: boolean;
        error: boolean;
        empty: boolean;
    };
    transactionTypeDetail: {
        id?: number;
        loading: boolean;
        error: boolean;
        data?: TransactionTypeDomain;
        submitting: boolean;
    };
}

// export interface ITransactionTypeFilterState {

// }
