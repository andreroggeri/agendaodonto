import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material';
import { BehaviorSubject, merge, Observable, Subscribable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { ScheduleFilter } from '../schedule/schedule.filter';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { PatientService } from './patient.service';

export class PatientSchedulesDataSource extends DataSource<IScheduleResponse> {
    isLoading = true;
    count = 0;
    filterChanges = new BehaviorSubject(null);
    changeEvents: Array<Subscribable<null>> = [this.paginator.page, this.filterChanges];
    private filter = new ScheduleFilter();

    constructor(private patientService: PatientService, private patientId: number, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<IScheduleResponse[]> {
        return merge(...this.changeEvents).pipe(
            switchMap(() => {
                this.isLoading = true;
                const offset = this.paginator.pageSize * this.paginator.pageIndex;
                this.filter.reset();
                this.filter.setFilterValue('orderBy', '-date');
                this.filter.setFilterValue('offset', offset.toString());
                this.filter.setFilterValue('pageSize', this.paginator.pageSize.toString());
                return this.patientService.getSchedules(this.patientId, this.filter).pipe(
                    finalize(() => this.isLoading = false),
                    map(response => {
                        this.count = response.count;
                        return response.results;
                    }),
                );
            }));

    }

    disconnect() { }
}
