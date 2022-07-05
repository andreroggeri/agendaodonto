import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

import { IPagedResponse } from '../shared/interceptors/responses';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { BaseService } from '../shared/services/base.service';
import { ScheduleFilter } from './schedule.filter';

@Injectable()
export class ScheduleService extends BaseService implements IScheduleService {

    constructor(private http: HttpClient) {
        super();
    }

    get(scheduleId: number): Observable<IScheduleResponse> {
        return this.http.get<IScheduleResponse>(this.url(['schedules', scheduleId]));
    }

    getAll(scheduleFilter?: ScheduleFilter): Observable<IPagedResponse<IScheduleResponse>> {
        const filter = scheduleFilter ? scheduleFilter : new ScheduleFilter();
        return this.http.get<IPagedResponse<IScheduleResponse>>(this.url(['schedules']), filter.getFilter());
    }

    create(schedule: IScheduleResponse): Observable<any> {
        const tmpSchedule: any = schedule;
        tmpSchedule.dentist = schedule.dentist.id;
        tmpSchedule.patient = schedule.patient.id;
        return this.http.post<IScheduleResponse>(this.url(['schedules']), JSON.stringify(tmpSchedule));
    }

    update(schedule: IScheduleResponse): Observable<any> {
        const tmpSchedule: any = schedule;
        tmpSchedule.dentist = schedule.dentist.id;
        tmpSchedule.patient = schedule.patient.id;
        return this.http.put<IScheduleResponse>(this.url(['schedules', schedule.id]), JSON.stringify(tmpSchedule));
    }

    remove(schedule: IScheduleResponse): Observable<any> {
        return this.http.delete(this.url(['schedules', schedule.id]));
    }

    save(schedule: IScheduleResponse): Observable<any> {
        if (schedule.id) {
            return this.update(schedule);
        } else {
            return this.create(schedule);
        }
    }

    updateNotificationStatus(schedule: IScheduleResponse, newStatus: number): Observable<any> {
        const payload = {
            new_status: newStatus,
        };
        return this.http.post(this.url(['schedules', schedule.id, 'notification']), JSON.stringify(payload));
    }

    getAttendanceData(referenceDate?: Date): Observable<IAttendanceResponse> {
        let params = new HttpParams();
        if (referenceDate) {
            params = params.set('date', format(referenceDate, 'YYYY-MM-DD'));
        }
        return this.http.get<IAttendanceResponse>(this.url(['schedules', 'attendance']), { params });
    }

}

export interface IScheduleService {
    get(scheduleId: number): Observable<IScheduleResponse>;
    getAll(filter?: ScheduleFilter): Observable<{ results: IScheduleResponse[] }>;
    create(schedule: IScheduleResponse): Observable<any>;
    update(schedule: IScheduleResponse): Observable<any>;
    save(schedule: IScheduleResponse): Observable<any>;
    getAttendanceData(referenceDate?: Date): Observable<IAttendanceResponse>;
}

export interface IAttendanceResponse {
    [key: string]: {
        absences: number,
        attendances: number,
        cancellations: number,
        ratio: number;
    };
}

export enum ScheduleStatus {
    Pending = 0,
    ShownUp = 1,
    Missed = 2,
    Canceled = 3,
}
