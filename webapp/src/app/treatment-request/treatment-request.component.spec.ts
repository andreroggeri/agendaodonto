import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Mock } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { BehaviorSubject } from 'rxjs';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { MaterialAppModule } from 'src/app/shared/material.app.module';
import { TreatmentRequestDatabase } from 'src/app/shared/testing/databases/treatment-request.database';
import { provideMock } from 'src/app/shared/testing/provide-mock';
import {
    TreatmentRequestStateService,
    initialState,
} from 'src/app/treatment-request/service/treatment-request.state';

import { TreatmentRequestComponent } from './treatment-request.component';

describe('TreatmentRequestComponent', () => {
    let component: TreatmentRequestComponent;
    let fixture: ComponentFixture<TreatmentRequestComponent>;
    let state: Mock<TreatmentRequestStateService>;
    let state$: BehaviorSubject<typeof initialState>;
    const db = new TreatmentRequestDatabase();

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                NoopAnimationsModule,
                HttpClientTestingModule,
                SharedComponentsModule,
            ],
            declarations: [TreatmentRequestComponent],
            providers: [provideMock(TreatmentRequestStateService)],
        });
    });

    beforeEach(() => {
        state$ = new BehaviorSubject(initialState);
        state = TestBed.get(TreatmentRequestStateService);
        state._spy.getState._func.and.returnValue(state$);
        fixture = TestBed.createComponent(TreatmentRequestComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load data when component is initialized', () => {
        const treatmentRequest = db.get();
        state$.next({
            ...state$.getValue(),
            treatmentRequests: [
                {
                    loading: false,
                    data: treatmentRequest,
                },
            ],
            count: 1,
        });
        fixture.detectChanges();

        const table = fixture.debugElement.query(By.css('table'));
        expect(
            fixture.debugElement.query(By.css(':not(table) mat-progress-bar')),
        ).toBeFalsy();
        expect(table).toBeTruthy();
        expect(table.nativeElement.textContent).toContain(
            treatmentRequest.patient_first_name,
        );
        expect(table.nativeElement.textContent).toContain(
            treatmentRequest.patient_last_name,
        );
        expect(table.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
        expect(state.fetchTreatmentRequests).toHaveBeenCalled();
    });

    it('should show error state when an error occurs', () => {
        state$.next({
            ...state$.getValue(),
            error: true,
        });
        fixture.detectChanges();
        const errorComponent = fixture.debugElement.query(
            By.css('app-empty-state'),
        );
        expect(
            fixture.debugElement.query(By.css('mat-progress-bar')),
        ).toBeFalsy();
        expect(fixture.debugElement.query(By.css('table'))).toBeFalsy();
        expect(errorComponent).toBeTruthy();
        expect(errorComponent.nativeElement.textContent).toContain(
            'Ocorreu um erro ao recuperar os dados',
        );
    });

    it('should show empty state when there is no data', () => {
        state$.next({
            ...state$.getValue(),
            treatmentRequests: [],
            count: 0,
        });

        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(
            By.css('app-empty-state'),
        );
        expect(
            fixture.debugElement.query(By.css('mat-progress-bar')),
        ).toBeFalsy();
        expect(fixture.debugElement.query(By.css('table'))).toBeFalsy();
        expect(emptyState).toBeTruthy();
        expect(emptyState.nativeElement.textContent).toContain(
            'Você ainda não tem solicitações de tratamentos.',
        );
    });

    it('should show loading state when loading', () => {
        state$.next({
            ...state$.getValue(),
            loading: true,
        });
        fixture.detectChanges();
        expect(
            fixture.debugElement.query(By.css('mat-progress-bar')),
        ).toBeTruthy();
        expect(fixture.debugElement.query(By.css('table'))).toBeFalsy();
        expect(
            fixture.debugElement.query(By.css('app-empty-state')),
        ).toBeFalsy();
    });
});
