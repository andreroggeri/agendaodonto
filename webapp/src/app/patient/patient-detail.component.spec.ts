import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Mock, MockFactory } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';

import { ClinicService } from '../clinic/clinic.service';
import { DentalPlanService } from '../dental-plan/dental-plan.service';
import { DataTablePagerModule } from '../shared/components/pager/datatable-pager.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { ClinicDatabase } from '../shared/testing/databases/clinic.database';
import { DentalPlanDatabase } from '../shared/testing/databases/dental-plan.database';
import { PatientDatabase } from '../shared/testing/databases/patient.database';
import { ScheduleDatabase } from '../shared/testing/databases/schedule.database';
import { PatientDetailComponent } from './patient-detail.component';
import { PatientService } from './patient.service';

describe('PatientDetailComponent', () => {
    const clinicDb = new ClinicDatabase();
    const patientDb = new PatientDatabase();
    const dentalPlanDb = new DentalPlanDatabase();
    const scheduleDb = new ScheduleDatabase();

    let component: PatientDetailComponent;
    let fixture: ComponentFixture<PatientDetailComponent>;
    let patientService: Mock<PatientService>;
    let clinicService: Mock<ClinicService>;
    let dentalPlanService: Mock<DentalPlanService>;
    let route: Mock<ActivatedRoute>;
    let router: Router;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                DirectivesModule,
                DataTablePagerModule,
                HttpClientTestingModule,
                RouterTestingModule,
                SharedComponentsModule,
            ],
            declarations: [PatientDetailComponent],
            providers: [
                { provide: PatientService, useFactory: () => patientService },
                { provide: ClinicService, useFactory: () => clinicService },
                { provide: DentalPlanService, useFactory: () => dentalPlanService },
                { provide: ActivatedRoute, useFactory: () => route },
            ],
        });

    });

    beforeEach(() => {
        patientService = MockFactory.create(PatientService);
        clinicService = MockFactory.create(ClinicService);
        dentalPlanService = MockFactory.create(DentalPlanService);
        route = MockFactory.create(ActivatedRoute);

        fixture = TestBed.createComponent(PatientDetailComponent);
        component = fixture.componentInstance;

        router = TestBed.get(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load the dental plans and clinics from the service', () => {
        const clinicsResponse = clinicDb.getAsResponse(5);
        const dentalPlansResponse = dentalPlanDb.getAsResponse(5);

        clinicService._spy.getAll._func.and.returnValue(of(clinicsResponse));
        dentalPlanService._spy.getAll._func.and.returnValue(of(dentalPlansResponse));
        route._spy.snapshot._get.and.returnValue({ params: { id: null } });

        fixture.detectChanges();

        expect(component.clinics).toEqual(clinicsResponse.results);
        expect(component.dentalPlans).toEqual(dentalPlansResponse.results);
    });

    it('should load the patient data if an id is provided via URL', () => {
        const patient = patientDb.get();
        clinicService._spy.getAll._func.and.returnValue(of(clinicDb.getAsResponse(5)));
        dentalPlanService._spy.getAll._func.and.returnValue(of(dentalPlanDb.getAsResponse(5)));
        patientService._spy.get._func.and.returnValue(of(patient));
        route._spy.snapshot._get.and.returnValue({ params: { id: 10 } });

        fixture.detectChanges();

        expect(patientService.get).toHaveBeenCalledTimes(1);
        expect(patientService.get).toHaveBeenCalledWith(10);
        expect(component.patientForm.value).toEqual({
            id: patient.id,
            name: patient.name,
            last_name: patient.last_name,
            phone: patient.phone,
            sex: patient.sex,
            clinic: patient.clinic,
            dental_plan: patient.dental_plan,
        });
    });

    it('should navigate to schedule when the schedule detail is clicked', () => {
        const schedules = scheduleDb.getAsResponse(5);
        clinicService._spy.getAll._func.and.returnValue(of(clinicDb.getAsResponse(5)));
        dentalPlanService._spy.getAll._func.and.returnValue(of(dentalPlanDb.getAsResponse(5)));
        patientService._spy.get._func.and.returnValue(of(patientDb.get()));
        patientService._spy.getSchedules._func.and.returnValue(of(schedules));

        route._spy.snapshot._get.and.returnValue({ params: { id: 10 } });

        const spy = spyOn(router, 'navigate');

        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table'));
        const rows: HTMLElement[] = table.nativeElement.querySelectorAll('tbody tr');

        rows[0].click();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(['agenda', schedules.results[0].id]);
    });
});
