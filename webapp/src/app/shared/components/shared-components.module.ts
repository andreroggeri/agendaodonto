import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientLookupComponent } from 'src/app/shared/components/patient-lookup/patient-lookup.component';

import { MaterialAppModule } from '../material.app.module';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { NotificationStatusComponent } from './notification-status/notification-status.component';
import { ScheduleStatusComponent } from './schedule-status/schedule-status.component';

@NgModule({
    imports: [
        CommonModule,
        MaterialAppModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
    ],
    declarations: [
        ScheduleStatusComponent,
        LoadingOverlayComponent,
        NotificationStatusComponent,
        EmptyStateComponent,
        PatientLookupComponent,
    ],
    exports: [
        ScheduleStatusComponent,
        LoadingOverlayComponent,
        NotificationStatusComponent,
        EmptyStateComponent,
        PatientLookupComponent,
    ],
    providers: [],
})
export class SharedComponentsModule {}
