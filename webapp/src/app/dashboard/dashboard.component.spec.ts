import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Mock, MockFactory } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';

import { DentalPlanService } from '../dental-plan/dental-plan.service';
import { PatientService } from '../patient/patient.service';
import { ScheduleService } from '../schedule/schedule.service';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let scheduleService: Mock<ScheduleService>;
    let patientService: Mock<PatientService>;
    let dentalPlanService: Mock<DentalPlanService>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialAppModule,
                DirectivesModule,
                SharedComponentsModule,
                NgxChartsModule,
                NoopAnimationsModule,
                RouterTestingModule,
            ],
            declarations: [DashboardComponent],
            providers: [
                { provide: ScheduleService, useFactory: () => scheduleService },
                { provide: PatientService, useFactory: () => patientService },
                { provide: DentalPlanService, useFactory: () => dentalPlanService },
            ],
        });
    });

    beforeEach(() => {
        scheduleService = MockFactory.create(ScheduleService);
        patientService = MockFactory.create(PatientService);
        dentalPlanService = MockFactory.create(DentalPlanService);

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the percentage as zero when there is no data from previous month', () => {
        expect(component.calculatePercentage(0, 1)).toBe(-100);
        expect(component.calculatePercentage(1, 0)).toBe(0);
    });
});
