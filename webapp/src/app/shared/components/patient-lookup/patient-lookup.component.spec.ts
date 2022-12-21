import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Mock } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';
import { PatientFilter } from 'src/app/patient/patient.filter';
import { PatientService } from 'src/app/patient/patient.service';
import { PatientLookupComponent } from 'src/app/shared/components/patient-lookup/patient-lookup.component';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { PatientDatabase } from 'src/app/shared/testing/databases/patient.database';
import { provideMock } from 'src/app/shared/testing/provide-mock';

describe('PatientLookupComponent', () => {
    const patientDb = new PatientDatabase();

    let patientService: Mock<PatientService>;
    let dialogRef: Mock<MatDialogRef<PatientLookupComponent>>;
    const dialogData = {
        treatmentRequest: { data: { patient_phone: '1243124' } },
    };
    let component: PatientLookupComponent;
    let fixture: ComponentFixture<PatientLookupComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [SharedComponentsModule, NoopAnimationsModule],
            providers: [
                provideMock(PatientService),
                provideMock(MatDialogRef),
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientLookupComponent);
        component = fixture.componentInstance;
        patientService = TestBed.get(PatientService);
        dialogRef = TestBed.get(MatDialogRef);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should use the phone from the dialog data', () => {
        patientService._spy.getAll._func.and.returnValue(
            of(patientDb.getAsResponse(10)),
        );

        fixture.detectChanges();

        const { field, value } = component.filterForm.value;
        expect(field).toEqual('phone');
        expect(value).toEqual(dialogData.treatmentRequest.data.patient_phone);
        expect(patientService.getAll).toHaveBeenCalledTimes(1);
        const usedFilter: PatientFilter =
            patientService._spy.getAll._func.calls.mostRecent().args[0];
        expect(usedFilter.getFilterValue('phone')).toEqual(
            dialogData.treatmentRequest.data.patient_phone,
        );
    });

    it('should render the patient list', () => {
        patientService._spy.getAll._func.and.returnValue(
            of(patientDb.getAsResponse(5)),
        );

        fixture.detectChanges();

        const rows = fixture.nativeElement.querySelectorAll('tr');
        expect(rows.length).toEqual(6);
    });

    it('should output the selected patient', () => {
        const patients = patientDb.getAsResponse(5);
        patientService._spy.getAll._func.and.returnValue(of(patients));
        fixture.detectChanges();
        const rows = fixture.debugElement.queryAll(By.css('tbody > tr'));

        expect(rows.length).toBe(patients.count);

        rows[0].triggerEventHandler('click', {});
        fixture.detectChanges();

        expect(dialogRef.close).toHaveBeenCalledTimes(1);
        expect(dialogRef.close).toHaveBeenCalledWith(patients.results[0]);
    });
});
