import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';

import { DataTablePagerModule } from '../shared/components/pager/datatable-pager.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { ClinicComponent } from './clinic.component';
import { ClinicService } from './clinic.service';

describe('ClinicComponent', () => {
    let component: ClinicComponent;
    let fixture: ComponentFixture<ClinicComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                DataTablePagerModule,
                NoopAnimationsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [ClinicComponent],
            providers: [
                ClinicService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClinicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
