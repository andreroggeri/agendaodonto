import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';

import { ClinicService } from '../clinic/clinic.service';
import { DentalPlanService } from '../dental-plan/dental-plan.service';
import { DataTablePagerModule } from '../shared/components/pager/datatable-pager.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { AuthGuard } from '../shared/guards/auth.guard';
import { MaterialAppModule } from '../shared/material.app.module';
import { PatientDetailComponent } from './patient-detail.component';
import { PatientComponent } from './patient.component';
import { PatientService } from './patient.service';

export const patientRoutes: Routes = [
    { path: 'pacientes', component: PatientComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:field/:value', component: PatientComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/:id', component: PatientDetailComponent, canActivate: [AuthGuard] },
    { path: 'pacientes/novo', component: PatientDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialAppModule,
        RouterModule,
        FlexLayoutModule,
        DataTablePagerModule,
        DirectivesModule,
        NgxMaskModule,
        SharedComponentsModule,
    ],
    declarations: [
        PatientComponent,
        PatientDetailComponent,
    ],
    providers: [
        PatientService,
        ClinicService,
        AuthGuard,
        DentalPlanService,
    ],
})
export class PatientModule {

}
