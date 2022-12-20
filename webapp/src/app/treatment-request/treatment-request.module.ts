import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { MaterialAppModule } from 'src/app/shared/material.app.module';
import { TreatmentRequestService } from 'src/app/treatment-request/service/treatment-request.service';
import { TreatmentRequestStateService } from 'src/app/treatment-request/service/treatment-request.state';
import { TreatmentRequestComponent } from './treatment-request.component';

export const treatmentRequestRoutes: Routes = [
    { path: 'solicitacao-tratamento', component: TreatmentRequestComponent },
];

@NgModule({
    declarations: [TreatmentRequestComponent],
    imports: [
        CommonModule,
        MaterialAppModule,
        FlexLayoutModule,
        SharedComponentsModule,
        FormsModule,
        DirectivesModule,
        ReactiveFormsModule,
        RouterModule.forChild(treatmentRequestRoutes),
    ],
    providers: [TreatmentRequestService, TreatmentRequestStateService],
})
export class TreatmentRequestModule {}
