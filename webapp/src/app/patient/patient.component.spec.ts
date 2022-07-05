import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';

import { DataTablePagerModule } from '../shared/components/pager/datatable-pager.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { PatientComponent } from './patient.component';
import { PatientService } from './patient.service';

describe('PatientComponent', () => {
    let component: PatientComponent;
    let fixture: ComponentFixture<PatientComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MaterialAppModule,
                DataTablePagerModule,
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [PatientComponent],
            providers: [
                PatientService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load filter from URL', () => {
        // route.testParams = { field: 'nome', value: 'Maria' };
        // expect(component.filterForm.controls.field.value).toBe('fullName');
        // expect(component.filterForm.controls.value.value).toBe('Maria');
    });
});
