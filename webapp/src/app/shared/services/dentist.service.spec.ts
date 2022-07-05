import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, getTestBed, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { IDentistResponse } from '../interfaces/services/dentist.model';
import { BaseService } from './base.service';
import { DentistService } from './dentist.service';

export const DENTISTS: IDentistResponse[] = [
    { id: 1, cro: '1234', cro_state: 'SP', email: 'john@doe.com', first_name: 'John', last_name: 'Doe', sex: 'M' },
];

const STATE_CHOICES = {
    actions: {
        POST: {
            cro_state: {
                choices: [
                    {
                        value: 'AC',
                        display_name: 'Acre',
                    },
                    {
                        value: 'AL',
                        display_name: 'Alagoas',
                    },
                ],
            },
        },
    },
};

describe('DentistService', () => {
    let injector: TestBed;
    let service: DentistService;
    let httpMock: HttpTestingController;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DentistService],
        });
    });

    beforeEach(() => {
        injector = getTestBed();
        service = injector.get(DentistService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should inject the service', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should search dentists by CRO', async(() => {
        service.get('XXXX').subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}dentists/?cro=XXXX`);
        expect(request.request.method).toBe('GET');
        request.flush(JSON.stringify(DENTISTS));
    }));

    it('should create detist', async(() => {
        const dentist = DENTISTS[0];
        service.create(dentist).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_AUTH_URL}register/`);
        expect(request.request.method).toBe('POST');
    }));

    it('should activate detist', async(() => {
        service.activate('UID0', 'TOKEN123').subscribe();
        const request = httpMock.expectOne(`${BaseService.API_AUTH_URL}activate/`);
        expect(request.request.method).toBe('POST');
    }));

    it('should get the states', async(() => {
        service.getStates().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_AUTH_URL}register/`);
        expect(request.request.method).toBe('OPTIONS');
        request.flush(STATE_CHOICES);
    }));

    it('should get the dentist detail', async(() => {
        service.me().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}dentists/me/`);
        expect(request.request.method).toBe('GET');
    }));

    it('should update the dentist detail', async(() => {
        const dentist = DENTISTS[0];
        service.update(dentist).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}dentists/me/`);
        expect(request.request.method).toBe('PUT');
    }));
});
