import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CalendarModule, DateAdapter, MOMENT } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { configureTestSuite } from 'ng-bullet';

import { MaterialAppModule } from '../shared/material.app.module';
import { ActivatedRouteStub } from '../shared/testing/activated-route.stub';
import { ScheduleComponent } from './schedule.component';
import { ScheduleService } from './schedule.service';

describe('ScheduleComponent', () => {
    let component: ScheduleComponent;
    let fixture: ComponentFixture<ScheduleComponent>;
    const routeMock = new ActivatedRouteStub();

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                CalendarModule.forRoot({ provide: DateAdapter, useFactory: () => adapterFactory(moment) }),
                RouterTestingModule,
                HttpClientTestingModule,
            ],
            declarations: [ScheduleComponent],
            providers: [
                { provide: MOMENT, useValue: moment },
                { provide: ActivatedRoute, useValue: routeMock },
                ScheduleService,
            ],
        });
    });

    beforeEach(() => {
        routeMock.testParams = {};
        fixture = TestBed.createComponent(ScheduleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load the date from URL', () => {
        routeMock.testParams = { view: 'dia', date: '2017-11-13' };
        expect(component.scheduleFilter.fields.find(v => v.name === 'startDate')!.value).toBe('2017-11-13');
        expect(component.scheduleFilter.fields.find(v => v.name === 'endDate')!.value).toBe('2017-11-13');
        routeMock.testParams = { view: 'semana', date: '2017-11-15 ' };
        expect(component.scheduleFilter.fields.find(v => v.name === 'startDate')!.value).toBe('2017-11-12');
        expect(component.scheduleFilter.fields.find(v => v.name === 'endDate')!.value).toBe('2017-11-18');
    });
});
