import { ITransactionTypeState } from 'src/app/finance/shared/models/transaction-type.state';

export interface IAppState {
    finance: { transactionTypes: ITransactionTypeState };
}
