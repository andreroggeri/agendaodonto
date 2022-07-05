import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { merge, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { CustomFB, CustomFG } from '../shared/validation';
import { ScheduleDatasource } from './schedule.datasource';
import { ScheduleService } from './schedule.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-schedule-list',
    templateUrl: './schedule-list.component.html',
    styleUrls: ['./schedule-list.component.scss'],
})
export class ScheduleListComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator;
    displayedColumns = ['select', 'date', 'patient', 'status'];
    dataSource: ScheduleDatasource;
    filterForm: CustomFG;
    selection = new SelectionModel<IScheduleResponse>(true);
    isUpdating = false;

    constructor(
        private scheduleService: ScheduleService,
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef) {
        const fb = new CustomFB();
        this.filterForm = fb.group({
            startDate: [''],
            endDate: [''],
            status: [''],
        });
    }

    ngOnInit() {
        this.dataSource = new ScheduleDatasource(this.scheduleService, this.paginator);
        this.setupUrlFilter();
    }

    filter() {
        const status = this.filterForm.controls.status.value;
        let startDate = this.filterForm.controls.startDate.value;
        let endDate = this.filterForm.controls.endDate.value;
        startDate = moment.isMoment(startDate) && startDate.isValid() ? startDate.format('DD-MM-YYYY') : '';
        endDate = moment.isMoment(endDate) && endDate.isValid() ? endDate.format('DD-MM-YYYY') : '';
        this.selection.clear();

        const navigationExtras = {
            queryParams: {
                dataInicio: startDate,
                dataFim: endDate,
                status,
            },
        };
        this.router.navigate(['/agenda/lista'], navigationExtras);
    }

    private parseDate(date: string): moment.Moment {
        const dateMoment = moment(date, 'DD-MM-YYYY');
        return dateMoment;
    }

    setupUrlFilter() {
        this.route.queryParams.subscribe((route) => {
            const status = route.status;
            const startDate = this.parseDate(route.dataInicio);
            const endDate = this.parseDate(route.dataFim);

            this.filterForm.controls.status.setValue(status);
            this.filterForm.controls.startDate.setValue(startDate);
            this.filterForm.controls.endDate.setValue(endDate);
            this.dataSource.scheduleFilter.reset();
            this.dataSource.scheduleFilter.setFilterValue('status', status);
            if (startDate.isValid()) {
                this.dataSource.scheduleFilter.setFilterValue('startDate', startDate.format('YYYY-MM-DD'));
            }
            if (endDate.isValid()) {
                this.dataSource.scheduleFilter.setFilterValue('endDate', endDate.format('YYYY-MM-DD'));
            }
            this.dataSource.filterChanges.next(null);
        });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.schedules.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        if (this.isAllSelected()) {
            this.selection.clear();
        } else {
            this.dataSource.schedules.forEach((row) => this.selection.select(row));
        }
    }

    setScheduleStatus(status) {
        const jobs: Array<Observable<any>> = [];
        this.isUpdating = true;
        this.selection.selected.forEach((schedule) => {
            const selectedSchedule = Object.assign({}, schedule); // Copy the object without reference
            selectedSchedule.status = status;
            jobs.push(this.scheduleService.save(selectedSchedule));
        });
        merge(...jobs).pipe(
            finalize(() => {
                this.selection.clear();
                this.dataSource.filterChanges.next(null);
                this.isUpdating = false;
                this.cdr.detectChanges();
            }),
        ).subscribe();
    }
}
