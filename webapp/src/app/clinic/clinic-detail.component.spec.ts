import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestSuite } from 'ng-bullet';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentistService } from '../shared/services/dentist.service';
import { ClinicDetailComponent } from './clinic-detail.component';
import { ClinicService } from './clinic.service';

describe('ClinicDetailComponent', () => {
    let component: ClinicDetailComponent;
    let fixture: ComponentFixture<ClinicDetailComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                DirectivesModule,
                HttpClientTestingModule,
                RouterTestingModule,
            ],
            declarations: [ClinicDetailComponent],
            providers: [
                ClinicService,
                DentistService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClinicDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
