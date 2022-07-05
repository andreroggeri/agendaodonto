import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestSuite } from 'ng-bullet';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentistService } from '../shared/services/dentist.service';
import { ConfirmComponent } from './confirm.component';

describe('ConfirmComponent', () => {
    let component: ConfirmComponent;
    let fixture: ComponentFixture<ConfirmComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                NoopAnimationsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [ConfirmComponent],
            providers: [
                DentistService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
