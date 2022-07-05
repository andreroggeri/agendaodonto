import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { CalendarModule, DateAdapter, MOMENT } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';

import { PatientService } from '../patient/patient.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { AuthGuard } from '../shared/guards/auth.guard';
import { MaterialAppModule } from '../shared/material.app.module';
import { ScheduleDetailComponent } from './schedule-detail.component';
import { ScheduleListComponent } from './schedule-list.component';
import { ScheduleComponent } from './schedule.component';
import { ScheduleService } from './schedule.service';

export const scheduleRoutes: Route[] = [
    { path: 'agenda/criar', component: ScheduleDetailComponent, canActivate: [AuthGuard] },
    { path: 'agenda/lista', component: ScheduleListComponent, canActivate: [AuthGuard] },
    { path: 'agenda/:id', component: ScheduleDetailComponent, canActivate: [AuthGuard] },
    { path: 'agenda/:view/:date', component: ScheduleComponent, canActivate: [AuthGuard] },
    { path: 'agenda/:view', component: ScheduleComponent, canActivate: [AuthGuard] },
    { path: 'agenda', component: ScheduleComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialAppModule,
        RouterModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        DirectivesModule,
        SharedComponentsModule,
        CalendarModule.forRoot(
            { provide: DateAdapter, useFactory: () => adapterFactory(moment) },
        ),
    ],
    declarations: [ScheduleComponent, ScheduleDetailComponent, ScheduleListComponent],
    providers: [
        ScheduleService, PatientService, AuthGuard,
        { provide: MOMENT, useValue: moment },
    ],
})
export class ScheduleModule {
}
