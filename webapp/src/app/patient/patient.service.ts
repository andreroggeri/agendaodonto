import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ScheduleFilter } from '../schedule/schedule.filter';
import { IPaginatedResponse } from '../shared/interfaces/services/paginated-response';
import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { BaseService } from '../shared/services/base.service';
import { PatientFilter } from './patient.filter';

@Injectable()
export class PatientService extends BaseService implements IPatientService {
    constructor(private http: HttpClient) {
        super();
    }

    getAll(
        patientFilter?: PatientFilter,
    ): Observable<IPaginatedResponse<IPatientResponse>> {
        const filter = patientFilter
            ? patientFilter.getFilter()
            : new PatientFilter().getFilter();
        return this.http.get<IPaginatedResponse<IPatientResponse>>(
            this.url(['patients']),
            filter,
        );
    }

    get(patientId: number): Observable<IPatientResponse> {
        return this.http.get<IPatientResponse>(
            this.url(['patients', patientId]),
        );
    }

    create(patient: IPatientResponse) {
        const data: any = patient;
        data.clinic = patient.clinic.id;
        if (patient.dental_plan) {
            data.dental_plan = patient.dental_plan.id;
        }
        return this.http.post<IPatientResponse>(
            this.url(['patients']),
            JSON.stringify(data),
        );
    }

    update(patient: IPatientResponse) {
        const data: any = patient;
        data.clinic = patient.clinic.id;
        if (patient.dental_plan) {
            data.dental_plan = patient.dental_plan.id;
        }
        return this.http.put<IPatientResponse>(
            this.url(['patients', patient.id]),
            JSON.stringify(data),
        );
    }

    remove(patient: IPatientResponse) {
        return this.http.delete(this.url(['patients', patient.id]));
    }

    save(patient: IPatientResponse): Observable<IPatientResponse> {
        if (patient.id) {
            return this.update(patient);
        } else {
            return this.create(patient);
        }
    }

    count() {
        const filter = new PatientFilter();
        filter.setFilterValue('pageSize', '1');
        return this.http
            .get(this.url(['patients']), filter.getFilter())
            .pipe(map((data: any) => data.count));
    }

    getSchedules(
        patientId: number,
        scheduleFilter?: ScheduleFilter,
    ): Observable<IPaginatedResponse<IScheduleResponse>> {
        const filter = scheduleFilter
            ? scheduleFilter.getFilter()
            : new ScheduleFilter().getFilter();
        return this.http.get<IPaginatedResponse<IScheduleResponse>>(
            this.url(['patients', patientId, 'schedules']),
            filter,
        );
    }
}

export interface IPatientService {
    getAll(): Observable<{ results: IPatientResponse[] }>;
    get(patientId: number): Observable<IPatientResponse>;
    create(patient: IPatientResponse);
    update(patient: IPatientResponse);
    remove(patient: IPatientResponse);
    save(patient: IPatientResponse);
    getSchedules(
        patientId: number,
        scheduleFilter?: ScheduleFilter,
    ): Observable<IPaginatedResponse<IScheduleResponse>>;
}
