import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { BehaviorSubject, merge, Observable, Subscribable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { PatientFilter } from './patient.filter';
import { PatientService } from './patient.service';

export class PatientDatasource extends DataSource<IPatientResponse> {
    isLoading = true;
    count = 0;
    filterChanges = new BehaviorSubject(null);
    changeEvents: Array<Subscribable<null>> = [this.filterChanges, this.paginator.page];
    patientFilter = new PatientFilter();
    schedules: IPatientResponse[];

    constructor(private patientService: PatientService, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<IPatientResponse[]> {

        return merge(...this.changeEvents).pipe(switchMap(() => {
            this.isLoading = true;
            const offset = this.paginator.pageSize * this.paginator.pageIndex;
            this.patientFilter.setFilterValue('pageSize', this.paginator.pageSize.toString());
            this.patientFilter.setFilterValue('offset', offset.toString());

            return this.patientService.getAll(this.patientFilter).pipe(
                finalize(() => this.isLoading = false),
                map(response => {
                    this.count = response.count;
                    if (this.count < offset) {
                        this.paginator.pageIndex = 0;
                        this.filterChanges.next(null);
                    }
                    this.schedules = response.results;
                    return response.results;
                }),
            );

        }));
    }
    disconnect(): void { }
}
