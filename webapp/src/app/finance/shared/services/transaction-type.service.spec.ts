import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { IPagedResponse } from '../../../shared/interceptors/responses';
import { ITransactionTypeResponse } from '../../../shared/interfaces/services/transaction-type-response.model';
import { BaseService } from '../../../shared/services/base.service';
import { TransactionTypeDatabase } from '../../../shared/testing/databases/transaction-type.database';
import { TransactionTypeFilter } from './transaction-type.filter';

import { TransactionTypeService } from './transaction-type.service';

const response = { id: 1, code: 123123, label: 'Some Label' };
const pagedResponse: IPagedResponse<ITransactionTypeResponse> = {
    count: 1,
    results: [response],
};

describe('TransactionTypeService', () => {
    let service: TransactionTypeService;
    let httpMock: HttpTestingController;
    const ttdb = new TransactionTypeDatabase();

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TransactionTypeService],
        });
    });

    beforeEach(() => {
        service = TestBed.get(TransactionTypeService);
        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get all transaction types', () => {
        service.getAll(1).subscribe(data => {
            expect(data.count).toBe(data.count);
            expect(data.results.length).toBe(data.count);
            expect(data.results[0].id).toEqual(1);
            expect(data.results[0].code).toEqual(123123);
            expect(data.results[0].label).toEqual('Some Label');
        });
        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/1/?offset=0&limit=10&ordering=id`);
        mock.flush(pagedResponse);
        expect(mock.request.method).toBe('GET');
    });

    it('should get all transaction types with filter', () => {
        const filter = new TransactionTypeFilter();
        filter.setFilterValue('pageSize', '500');
        service.getAll(5, filter).subscribe();
        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/5/?offset=0&limit=500&ordering=id`);
        mock.flush(pagedResponse);
        expect(mock.request.method).toBe('GET');
    });

    it('should get a transaction type', () => {
        service.get(2, 123123).subscribe(data => {
            expect(data.id).toEqual(response.id);
            expect(data.code).toEqual(response.code);
            expect(data.label).toEqual(response.label);
        });

        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/2/123123/`);
        mock.flush(response);
        expect(mock.request.method).toBe('GET');
    });

    it('should create a transaction type', () => {
        const domain = ttdb.get();
        delete domain.id;

        service.save(1, domain).subscribe();

        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/1/`);
        mock.flush(null);
        expect(mock.request.method).toBe('POST');
    });

    it('should update a transaction type', () => {
        const domain = ttdb.get();

        service.save(1, domain).subscribe();

        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/1/${domain.id}/`);
        mock.flush(null);
        expect(mock.request.method).toBe('PUT');
    });

    it('should delete a transaction type', () => {
        const domain = ttdb.get();

        service.delete(1, domain.id).subscribe();

        const mock = httpMock.expectOne(`${BaseService.API_ENDPOINT}finance/transaction-types/1/${domain.id}/`);
        mock.flush(null);
        expect(mock.request.method).toBe('DELETE');
    });

});
