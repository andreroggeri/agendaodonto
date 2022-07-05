import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialAppModule } from '../material.app.module';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { NotificationStatusComponent } from './notification-status/notification-status.component';
import { ScheduleStatusComponent } from './schedule-status/schedule-status.component';

@NgModule({
    imports: [CommonModule, MaterialAppModule],
    declarations: [ScheduleStatusComponent, LoadingOverlayComponent, NotificationStatusComponent, EmptyStateComponent],
    exports: [ScheduleStatusComponent, LoadingOverlayComponent, NotificationStatusComponent, EmptyStateComponent],
    providers: [],
})
export class SharedComponentsModule {

}
