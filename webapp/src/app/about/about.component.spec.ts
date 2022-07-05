import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestSuite } from 'ng-bullet';
import { MaterialAppModule } from '../shared/material.app.module';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
    let component: AboutComponent;
    let fixture: ComponentFixture<AboutComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                RouterTestingModule,
            ],
            declarations: [AboutComponent],
            providers: [],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AboutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
