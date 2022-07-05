import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarDateFormatter, CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { addDays, addMinutes, addWeeks, endOfWeek, format, parse, startOfWeek, subDays, subWeeks } from 'date-fns';
import { finalize } from 'rxjs/operators';

import { IStatus, NotificationStatusComponent } from '../shared/components/notification-status/notification-status.component';
import { LocalizedCalendarHeader } from '../shared/providers/localizedheader.provider';
import { getMatchedField, getReversedMatchField, IMatcher } from '../shared/util';
import { ScheduleFilter } from './schedule.filter';
import { ScheduleService } from './schedule.service';

type ViewType = 'week' | 'day';

interface IScheduleEvent extends CalendarEvent {
    id: number;
    notificationStatus: IStatus;
}

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss'],
    providers: [{ provide: CalendarDateFormatter, useClass: LocalizedCalendarHeader }],
})
export class ScheduleComponent implements OnInit {
    static COLORS: EventColor[] = [
        { primary: '#1e90ff', secondary: '#D1E8FF' },
        { primary: '#39c052', secondary: '#c1f4be' },
        { primary: '#ad2121', secondary: '#f2b5b5' },
        { primary: '#4f4f4f', secondary: '#c2c2c2' },
    ];
    view: ViewType = 'week';
    scheduleFilter = new ScheduleFilter();
    currentDate: Date = new Date();
    schedules: IScheduleEvent[] = [];
    isLoading = true;
    urlViews: IMatcher[] = [
        { name: 'day', prettyName: 'dia' },
        { name: 'week', prettyName: 'semana' },
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private scheduleService: ScheduleService,
    ) {
    }

    ngOnInit() {
        this.setupUrlFilterListener();
    }

    getSchedules() {
        this.isLoading = true;
        this.scheduleFilter.setFilterValue('pageSize', '100');
        if (this.view === 'day') {
            this.scheduleFilter.setFilterValue('startDate', format(this.currentDate, 'YYYY-MM-DD'));
            this.scheduleFilter.setFilterValue('endDate', format(this.currentDate, 'YYYY-MM-DD'));
        } else {
            this.scheduleFilter.setFilterValue('startDate', format(startOfWeek(this.currentDate), 'YYYY-MM-DD'));
            this.scheduleFilter.setFilterValue('endDate', format(endOfWeek(this.currentDate), 'YYYY-MM-DD'));
        }
        this.scheduleService.getAll(this.scheduleFilter).pipe(
            finalize(() => this.isLoading = false),
        ).subscribe((schedules) => {
            const tmpArray: IScheduleEvent[] = [];
            schedules.results.map((schedule) => {
                const text = schedule.patient.name + ' ' + schedule.patient.last_name;
                const notificationStatus = NotificationStatusComponent.statusLookup(schedule.notification_status);
                tmpArray.push({
                    id: schedule.id,
                    start: new Date(schedule.date),
                    end: addMinutes(new Date(schedule.date), schedule.duration),
                    title: text,
                    color: ScheduleComponent.COLORS[schedule.status],
                    notificationStatus,
                });
                this.schedules = tmpArray;
            });
        },
        );
    }

    setView(view: ViewType) {
        this.view = view;
        this.reload();
    }

    increment() {
        const addFn = {
            week: addWeeks,
            day: addDays,
        }[this.view];
        this.currentDate = addFn(this.currentDate, 1);
        this.reload();
    }

    decrement() {
        const subFn = {
            week: subWeeks,
            day: subDays,
        }[this.view];
        this.currentDate = subFn(this.currentDate, 1);
        this.reload();
    }

    today() {
        this.currentDate = new Date();
        this.reload();
    }

    reload() {
        this.router.navigate(['/agenda/', getReversedMatchField(this.view, this.urlViews), this.getDateForUrl()]);
    }

    eventClick({ event: event }) {
        this.router.navigate(['/agenda/', event.id]);
    }

    setupUrlFilterListener() {
        this.route.params.subscribe(
            (params) => {
                if (params.view !== undefined) {
                    this.view = getMatchedField(params.view, this.urlViews) as ViewType;
                }

                if (params.date !== undefined) {
                    const date = parse(params.date);
                    this.currentDate = date;
                }

                this.getSchedules();
            },
        );
    }

    getDateForUrl(): string {
        return format(this.currentDate, 'YYYY-MM-DD');
    }
}
