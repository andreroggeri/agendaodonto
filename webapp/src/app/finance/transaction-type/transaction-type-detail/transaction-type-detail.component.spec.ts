import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { Mock } from 'jasmine-mock-factory';
import { of } from 'rxjs';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { MaterialAppModule } from 'src/app/shared/material.app.module';
import { TransactionTypeDatabase } from 'src/app/shared/testing/databases/transaction-type.database';

import { ClinicService } from '../../../clinic/clinic.service';
import { DirectivesModule } from '../../../shared/directives/directives.module';
import { IClinicResponse } from '../../../shared/interfaces/services/clinic.model';
import { IAppState } from '../../../shared/state/app-state.interface';
import { ClinicDatabase } from '../../../shared/testing/databases/clinic.database';
import { provideMock } from '../../../shared/testing/provide-mock';
import { TransactionTypeDomain } from '../../shared/models/transaction-type.domain';
import { TransactionTypeService } from '../../shared/services/transaction-type.service';
import { clinicSelected, loadTransactionTypeDetail } from '../../store/actions/transaction-type.actions';
import { TransactionTypeEffects } from '../../store/effects/transaction-type.effects';
import { transactionTypeReducer } from '../../store/reducers/transaction-type.reducer';
import { TransactionTypeDetailComponent } from './transaction-type-detail.component';

describe('TransactionTypeDetailComponent', () => {
    let component: TransactionTypeDetailComponent;
    let fixture: ComponentFixture<TransactionTypeDetailComponent>;
    let transactionTypeService: Mock<TransactionTypeService>;
    let clinicService: Mock<ClinicService>;
    let store: Store<IAppState>;
    let router: Router;

    const ttdb = new TransactionTypeDatabase();
    const cdb = new ClinicDatabase();
    let clinic: IClinicResponse;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                SharedComponentsModule,
                StoreModule.forFeature('finance', { transactionTypes: transactionTypeReducer }),
                StoreModule.forRoot({}, {}),
                EffectsModule.forRoot([]),
                EffectsModule.forFeature([TransactionTypeEffects]),
                NoopAnimationsModule,
                RouterTestingModule,
                DirectivesModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [TransactionTypeDetailComponent],
            providers: [
                provideMock(TransactionTypeService), provideMock(ClinicService),
            ],
        });

        transactionTypeService = TestBed.get(TransactionTypeService);
        clinicService = TestBed.get(ClinicService);
        store = TestBed.get(Store);
        router = TestBed.get(Router);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TransactionTypeDetailComponent);
        component = fixture.componentInstance;
        clinic = cdb.get();

        spyOn(router, 'navigate').and.returnValue(new Promise((r) => r(true)));
        transactionTypeService._spy.getAll._func.and.returnValue(of(ttdb.getAsResponse(5)));
        store.dispatch(clinicSelected({ clinic }));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load the transaction type detail', () => {
        // Arrange
        const transactionType = ttdb.get();
        transactionTypeService._spy.get._func.and.returnValue(of(transactionType));
        store.dispatch(loadTransactionTypeDetail({ transactionTypeId: 1 }));

        // Act
        fixture.detectChanges();

        // Assert
        const codeInput = fixture.debugElement.query(By.css('#transaction-type-code'));
        const labelInput = fixture.debugElement.query(By.css('#transaction-type-label'));
        expect(codeInput.nativeElement.value).toEqual(transactionType.code.toString());
        expect(labelInput.nativeElement.value).toEqual(transactionType.label);
    });

    it('should update a transaction type', () => {
        // Arrange
        const transactionType = ttdb.get();
        transactionTypeService._spy.get._func.and.returnValue(of(transactionType));
        transactionTypeService._spy.save._func.and.returnValue(of(null));
        store.dispatch(loadTransactionTypeDetail({ transactionTypeId: 1 }));
        fixture.detectChanges();

        const codeInput = fixture.debugElement.query(By.css('#transaction-type-code'));
        const labelInput = fixture.debugElement.query(By.css('#transaction-type-label'));
        labelInput.nativeElement.value = 'Some Other Input';
        labelInput.triggerEventHandler('input', { target: labelInput.nativeElement });
        codeInput.nativeElement.value = '9994444';
        codeInput.triggerEventHandler('input', { target: codeInput.nativeElement });
        fixture.detectChanges();

        // Act
        const saveButton = fixture.debugElement.query(By.css('button[color="accent"]'));
        saveButton.nativeElement.click();
        fixture.detectChanges();

        // Assert
        const expectedDomain = new TransactionTypeDomain();
        expectedDomain.id = transactionType.id;
        expectedDomain.code = 9994444;
        expectedDomain.label = 'Some Other Input';
        expect(transactionTypeService.save).toHaveBeenCalledTimes(1);
        expect(transactionTypeService.save).toHaveBeenCalledWith(clinic.id, expectedDomain);
    });

    it('should delete a transaction type', () => {
        // Arrange
        const transactionType = ttdb.get();
        transactionTypeService._spy.get._func.and.returnValue(of(transactionType));
        transactionTypeService._spy.delete._func.and.returnValue(of(null));
        store.dispatch(loadTransactionTypeDetail({ transactionTypeId: 1 }));
        fixture.detectChanges();

        // Act
        const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
        deleteButton.nativeElement.click();
        fixture.detectChanges();

        // Assert
        expect(transactionTypeService.delete).toHaveBeenCalledTimes(1);
        expect(transactionTypeService.delete).toHaveBeenCalledWith(clinic.id, transactionType.id);
    });

});
