import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';

import { PATIENTS } from '../patient/patient.service.spec';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { BaseService } from '../shared/services/base.service';
import { DENTISTS } from '../shared/services/dentist.service.spec';
import { ScheduleFilter } from './schedule.filter';
import { ScheduleService } from './schedule.service';

export const SCHEDULES: IScheduleResponse[] = [
    {
        id: 1,
        date: '2018-01-29T19:12:49.690973Z',
        dentist: DENTISTS[0], duration: 30,
        notification_status: '1',
        patient: PATIENTS[0],
        status: 1,
    },
];

describe('ScheduleService', () => {
    let injector: TestBed;
    let service: ScheduleService;
    let httpMock: HttpTestingController;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ScheduleService],
        });
    });

    beforeEach(() => {
        injector = getTestBed();
        service = injector.get(ScheduleService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should inject the service', () => {
        expect(service).toBeTruthy();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should get all schedules', () => {
        service.getAll().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/?offset=0&limit=10&ordering=date`);
        expect(request.request.method).toBe('GET');
    });

    it('should get all schedules with filter', () => {
        const filter = new ScheduleFilter();
        filter.setFilterValue('status', '1');
        service.getAll(filter).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/?offset=0&limit=10&ordering=date&status=1`);
        expect(request.request.method).toBe('GET');
    });

    it('should get schedule details', () => {
        service.get(1).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/1/`);
        expect(request.request.method).toBe('GET');
    });

    it('should create a schedule', () => {
        service.create(SCHEDULES[0]).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/`);
        expect(request.request.method).toBe('POST');
    });

    it('should update a schedule', () => {
        const schedule = SCHEDULES[0];
        service.update(schedule).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/${schedule.id}/`);
        expect(request.request.method).toBe('PUT');
    });

    it('should remove a schedule', () => {
        const schedule = SCHEDULES[0];
        service.remove(schedule).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/${schedule.id}/`);
        expect(request.request.method).toBe('DELETE');
    });

    it('should create a schedule when saving without id', () => {
        const schedule = Object.assign({}, SCHEDULES[0]);
        delete schedule.id;
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(schedule);
        expect(service.create).toHaveBeenCalled();
        expect(service.update).toHaveBeenCalledTimes(0);
    });

    it('should update a schedule when saving with id', () => {
        const schedule = SCHEDULES[0];
        spyOn(service, 'create');
        spyOn(service, 'update');
        service.save(schedule);
        expect(service.update).toHaveBeenCalled();
        expect(service.create).toHaveBeenCalledTimes(0);
    });

    it('should get the attendance data', () => {
        service.getAttendanceData().subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/attendance/`);
        expect(request.request.method).toBe('GET');
    });

    it('should get the attendance data with reference date', () => {
        const refDate = new Date('2017-01-01 10:00');
        service.getAttendanceData(refDate).subscribe();
        const request = httpMock.expectOne(`${BaseService.API_ENDPOINT}schedules/attendance/?date=2017-01-01`);
        expect(request.request.method).toBe('GET');
    });

});
