import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import * as d3 from 'd3';
import {
    addMonths,
    endOfMonth,
    format,
    isAfter,
    isBefore,
    startOfMonth,
    subMonths,
} from 'date-fns';
import * as ptLocale from 'date-fns/locale/pt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITreatmentRequestResponse } from 'src/app/shared/interfaces/services/treatment-request.response';
import { TreatmentRequestFilter } from 'src/app/treatment-request/service/treatment-request.filter';
import { TreatmentRequestService } from 'src/app/treatment-request/service/treatment-request.service';

import { DentalPlanService } from '../dental-plan/dental-plan.service';
import { PatientFilter } from '../patient/patient.filter';
import { PatientService } from '../patient/patient.service';
import { ScheduleFilter } from '../schedule/schedule.filter';
import { ScheduleService } from '../schedule/schedule.service';
import { IPaginatedResponse } from '../shared/interfaces/services/paginated-response';
import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { parseAttendanceData } from './dashboard.utils';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    pendingSchedules: Observable<IPaginatedResponse<IScheduleResponse>>;
    pendingTreatmentRequests: Observable<
        IPaginatedResponse<ITreatmentRequestResponse>
    >;
    refSchedules: Observable<IPaginatedResponse<IScheduleResponse>>;
    patients: Observable<IPaginatedResponse<IPatientResponse>>;
    attendance: Observable<any>;
    attendanceRatio: Observable<any>;
    dentalPlanStats: Observable<object>;
    currentDate = subMonths(new Date(), 1);
    curveFunction = d3.curveCatmullRom;
    attendanceChartColors = [
        { name: 'Comparecimentos', value: '#4CAF50' },
        { name: 'Faltas', value: '#f44336' },
        { name: 'Cancelamentos', value: '#e0e0e0' },
    ];

    get startDate() {
        return format(startOfMonth(this.currentDate), 'YYYY-MM-DD');
    }
    get endDate() {
        return format(endOfMonth(this.currentDate), 'YYYY-MM-DD');
    }
    get refDate() {
        return subMonths(this.currentDate, 1);
    }
    get refStartDate() {
        return format(startOfMonth(this.refDate), 'YYYY-MM-DD');
    }
    get refEndDate() {
        return format(endOfMonth(this.refDate), 'YYYY-MM-DD');
    }
    get currentMonthLabel() {
        return format(this.currentDate, 'MMMM/YYYY', { locale: ptLocale });
    }

    constructor(
        private scheduleService: ScheduleService,
        private patientService: PatientService,
        private router: Router,
        private dentalPlanService: DentalPlanService,
        private treatmentRequestService: TreatmentRequestService,
    ) {}

    ngOnInit() {
        this.setupObservables();
    }

    calculatePercentage(n1: number, n2: number) {
        if (n2 === 0) {
            return 0;
        }
        return Math.round((n1 / n2 - 1) * 100);
    }

    setupObservables() {
        // Patients
        const patientFilter = new PatientFilter();
        patientFilter.setFilterValue('pageSize', '1');
        patientFilter.setFilterValue('createdBefore', this.endDate);
        this.patients = this.patientService.getAll(patientFilter);
        // Pending Schedules
        const scheduleFilter = new ScheduleFilter();
        scheduleFilter.setFilterValue('pageSize', '1');
        scheduleFilter.setFilterValue(
            'endDate',
            format(new Date(), 'YYYY-MM-DD'),
        );
        scheduleFilter.setFilterValue('status', '0');
        this.pendingSchedules = this.scheduleService.getAll(scheduleFilter);
        // Schedules
        scheduleFilter.setFilterValue('startDate', this.refStartDate);
        scheduleFilter.setFilterValue('endDate', this.refEndDate);
        this.refSchedules = this.scheduleService.getAll(scheduleFilter);
        // Pending Treatment Requests
        const treatmentRequestFilter = new TreatmentRequestFilter();
        treatmentRequestFilter.setFilterValue('status', 'READY');
        this.pendingTreatmentRequests = this.treatmentRequestService.list(
            treatmentRequestFilter,
        );

        // Attendance
        this.attendance = this.scheduleService
            .getAttendanceData(this.currentDate)
            .pipe(
                map((data) => {
                    return parseAttendanceData(data);
                }),
            );

        this.attendanceRatio = this.scheduleService.getAttendanceData();

        this.dentalPlanStats = this.dentalPlanService
            .getStats(
                startOfMonth(this.currentDate),
                endOfMonth(this.currentDate),
            )
            .pipe(
                map((values) =>
                    values.map((v) => {
                        return {
                            name: v.dental_plan || 'Sem Plano',
                            value: v.count,
                        };
                    }),
                ),
            );
    }

    viewPendingSchedules() {
        const extras: NavigationExtras = {};
        extras.queryParams = {
            dataFim: format(new Date(), 'DD-MM-YYYY'),
            status: '0',
        };
        this.router.navigate(['/agenda/lista'], extras);
    }

    viewSchedules() {
        const extras: NavigationExtras = {};
        extras.queryParams = {
            dataInicio: format(startOfMonth(this.currentDate), 'DD-MM-YYYY'),
            dataFim: format(endOfMonth(this.currentDate), 'DD-MM-YYYY'),
        };
        this.router.navigate(['/agenda/lista'], extras);
    }

    viewPendingTreatmentRequests() {
        this.router.navigate(['/solicitacao-tratamento']);
    }

    viewPatients() {
        this.router.navigate(['/pacientes']);
    }

    previousMonth() {
        if (isBefore(this.currentDate, '2019-01-01')) {
            return;
        }
        this.currentDate = subMonths(this.currentDate, 1);
        this.setupObservables();
    }

    nextMonth() {
        if (isAfter(this.currentDate, subMonths(new Date(), 2))) {
            return;
        }

        this.currentDate = addMonths(this.currentDate, 1);
        this.setupObservables();
    }
}
