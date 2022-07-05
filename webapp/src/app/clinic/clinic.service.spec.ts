import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { IClinicResponse } from '../shared/interfaces/services/clinic.model';
import { BaseService } from '../shared/services/base.service';
import { DENTISTS } from '../shared/services/dentist.service.spec';
import { ClinicFilter } from './clinic.filter';
import { ClinicService } from './clinic.service';

export const CLINICS: IClinicResponse[] = [
    { id: 1, dentists: DENTISTS, name: 'Clinic 1' },
];

describe('ClinicService', () => {
    let injector: TestBed;
    let service: ClinicService;
    let httpMock: HttpTestingController;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ClinicService],
        });
    });

    beforeEach(() => {
        injector = getTestBed();
        service = injector.get(ClinicService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should inject the service', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get all clinics', () => {
        service.getAll().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/?offset=0&limit=10&ordering=id`);
        expect(request.request.method).toBe('GET');
    });

    it('should get all clinics with filter', () => {
        const filter = new ClinicFilter();
        filter.setFilterValue('offset', '10');
        service.getAll(filter).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/?offset=10&limit=10&ordering=id`);
        expect(request.request.method).toBe('GET');
    });

    it('should get clinic details', () => {
        service.get(1).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/1/`);
        expect(request.request.method).toBe('GET');
    });

    it('should create a clinic', () => {
        service.create(CLINICS[0]).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/`);
        expect(request.request.method).toBe('POST');
    });

    it('should update a clinic', () => {
        const clinic = CLINICS[0];
        service.update(clinic).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/${clinic.id}/`);
        expect(request.request.method).toBe('PUT');
    });

    it('should remove a clinic', () => {
        const clinic = CLINICS[0];
        service.remove(clinic).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}clinics/${clinic.id}/`);
        expect(request.request.method).toBe('DELETE');
    });

    it('should create a clinic when saving without id', () => {
        const clinic = Object.assign({}, CLINICS[0]);
        delete clinic.id;
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(clinic);
        expect(service.create).toHaveBeenCalled();
        expect(service.update).toHaveBeenCalledTimes(0);
    });

    it('should update a clinic when saving with id', () => {
        const clinic = CLINICS[0];
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(clinic);
        expect(service.update).toHaveBeenCalled();
        expect(service.create).toHaveBeenCalledTimes(0);
    });

});
