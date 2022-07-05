import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';

import { PatientService } from '../patient/patient.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { ScheduleDetailComponent } from './schedule-detail.component';
import { ScheduleService } from './schedule.service';

describe('ScheduleDetailComponent', () => {
    let component: ScheduleDetailComponent;
    let fixture: ComponentFixture<ScheduleDetailComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                DirectivesModule,
                SharedComponentsModule,
                HttpClientTestingModule,
                RouterTestingModule,
            ],
            declarations: [ScheduleDetailComponent],
            providers: [
                ScheduleService,
                PatientService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScheduleDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
