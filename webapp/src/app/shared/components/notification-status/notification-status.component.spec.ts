import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { configureTestSuite } from 'ng-bullet';
import { MaterialAppModule } from '../../material.app.module';
import { NotificationStatusComponent } from './notification-status.component';

describe('Notification Status Component', () => {
    let component: NotificationStatusComponent;
    let fixture: ComponentFixture<NotificationStatusComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [MaterialAppModule],
            declarations: [NotificationStatusComponent],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NotificationStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
