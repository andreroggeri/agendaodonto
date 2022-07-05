import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModule } from '../shared/components/confirm-dialog/confirm-dialog.module';
import { DataTablePagerModule } from '../shared/components/pager/datatable-pager.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { AuthGuard } from '../shared/guards/auth.guard';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentistService } from '../shared/services/dentist.service';
import { ClinicDetailComponent } from './clinic-detail.component';
import { ClinicComponent } from './clinic.component';
import { ClinicService } from './clinic.service';

export const clinicRoutes: Routes = [
    { path: 'clinicas', component: ClinicComponent, canActivate: [AuthGuard] },
    { path: 'clinicas/:id', component: ClinicDetailComponent, canActivate: [AuthGuard] },
    { path: 'clinicas/criar', component: ClinicDetailComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialAppModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        RouterModule,
        ReactiveFormsModule,
        ConfirmDialogModule,
        DataTablePagerModule,
        DirectivesModule,
    ],
    declarations: [ClinicComponent, ClinicDetailComponent],
    providers: [ClinicService, DentistService, AuthGuard],
    entryComponents: [ConfirmDialogComponent],
})
export class ClinicModule {
}
