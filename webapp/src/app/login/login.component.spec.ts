import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestSuite } from 'ng-bullet';
import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { TokenService } from '../shared/services/token.service';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [
                HttpClientTestingModule,
                MaterialAppModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
                DirectivesModule,
                RouterTestingModule,
            ],
            providers: [
                TokenService,
                LoginService,
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
