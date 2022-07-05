import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModule } from '../shared/components/confirm-dialog/confirm-dialog.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentalPlanDetailComponent } from './dental-plan-detail/dental-plan-detail.component';
import { DentalPlanComponent } from './dental-plan/dental-plan.component';

export const dentalPlanRoutes: Routes = [
    { path: 'planos', component: DentalPlanComponent },
    { path: 'planos/:id', component: DentalPlanDetailComponent },
    { path: 'planos/novo', component: DentalPlanDetailComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        MaterialAppModule,
        ReactiveFormsModule,
        DirectivesModule,
        FlexLayoutModule,
        ConfirmDialogModule,
    ],
    declarations: [DentalPlanComponent, DentalPlanDetailComponent],
    entryComponents: [ConfirmDialogComponent],
})
export class DentalPlanModule { }
