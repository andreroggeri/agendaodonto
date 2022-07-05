import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { CLINICS } from '../clinic/clinic.service.spec';
import { ScheduleFilter } from '../schedule/schedule.filter';
import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { BaseService } from '../shared/services/base.service';
import { PatientDatabase } from '../shared/testing/databases/patient.database';
import { PatientFilter } from './patient.filter';
import { PatientService } from './patient.service';

export const PATIENTS: IPatientResponse[] = [
    { id: 1, name: 'John', last_name: 'Doe', phone: '1234', sex: 'M', clinic: CLINICS[0], dental_plan: { name: 'xpto' } },
];

describe('PatientService', () => {
    let injector: TestBed;
    let service: PatientService;
    let httpMock: HttpTestingController;
    let patient: IPatientResponse;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PatientService],
        });
    });

    beforeEach(() => {
        injector = getTestBed();
        service = injector.get(PatientService);
        httpMock = injector.get(HttpTestingController);
        patient = new PatientDatabase().get();
    });

    it('should inject the service', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get all patients', () => {
        service.getAll().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/?offset=0&limit=10&ordering=name`);
        expect(request.request.method).toBe('GET');
    });

    it('should get all patients with filter', () => {
        const filter = new PatientFilter();
        filter.setFilterValue('fullName', 'Juca');
        service.getAll(filter).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/?offset=0&limit=10&ordering=name&full_name=Juca`);
        expect(request.request.method).toBe('GET');
    });

    it('should get patient details', () => {
        service.get(1).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/1/`);
        expect(request.request.method).toBe('GET');
    });

    it('should create a patient', () => {
        service.create(patient).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/`);
        expect(request.request.method).toBe('POST');
    });

    it('should update a patient', () => {
        service.update(patient).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/${patient.id}/`);
        expect(request.request.method).toBe('PUT');
    });

    it('should remove a patient', () => {
        service.remove(patient).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/${patient.id}/`);
        expect(request.request.method).toBe('DELETE');
    });

    it('should count the patients', () => {
        service.count().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/?offset=0&limit=1&ordering=name`);
        expect(request.request.method).toBe('GET');
        request.flush({ count: 20 });
    });

    it('should get the patient schedules', () => {
        service.getSchedules(patient.id).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/${patient.id}/schedules/?offset=0&limit=10&ordering=date`);
        expect(request.request.method).toBe('GET');
    });

    it('should get the patient schedules based on the filter', () => {
        const filter = new ScheduleFilter();
        filter.setFilterValue('orderBy', '-date');
        service.getSchedules(patient.id, filter).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}patients/${patient.id}/schedules/?offset=0&limit=10&ordering=-date`);
        expect(request.request.method).toBe('GET');
    });

    it('should create a patient when saving without id', () => {
        delete patient.id;
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(patient);
        expect(service.create).toHaveBeenCalled();
        expect(service.update).toHaveBeenCalledTimes(0);
    });

    it('should update a patient when saving with id', () => {
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(patient);
        expect(service.update).toHaveBeenCalled();
        expect(service.create).toHaveBeenCalledTimes(0);
    });

});
