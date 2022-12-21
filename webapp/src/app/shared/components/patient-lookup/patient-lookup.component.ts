import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PatientFilter } from 'src/app/patient/patient.filter';
import { PatientService } from 'src/app/patient/patient.service';
import { IPatientResponse } from 'src/app/shared/interfaces/services/patient.model';
import { ITreatmentRequestRow } from 'src/app/treatment-request/service/treatment-request.state';

@Component({
    selector: 'app-patient-lookup',
    templateUrl: './patient-lookup.component.html',
})
export class PatientLookupComponent implements OnInit {
    loading = false;
    error = false;
    rows$: BehaviorSubject<IPatientResponse[]> = new BehaviorSubject([]);
    filterForm: FormGroup;
    columnsToDisplay = ['name', 'lastName', 'phone'];

    constructor(
        private patientService: PatientService,
        public dialogRef: MatDialogRef<PatientLookupComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { treatmentRequest: ITreatmentRequestRow },
    ) {
        this.filterForm = new FormBuilder().group({
            field: [''],
            value: [''],
        });
    }

    ngOnInit() {
        this.filterForm.controls.field.setValue('phone');
        this.filterForm.controls.value.setValue(
            this.data.treatmentRequest.data.patient_phone,
        );
        this.filter();
    }

    filter() {
        const { field, value } = this.filterForm.value;
        const filter = new PatientFilter();
        if (field && value) {
            filter.setFilterValue(field, value);
        }
        this.loading = true;
        this.patientService
            .getAll(filter)
            .pipe(
                catchError((err) => {
                    this.error = true;
                    return [];
                }),
                finalize(() => {
                    this.loading = false;
                }),
            )
            .subscribe((response) => this.rows$.next(response.results));
    }

    selectPatient(patient: IPatientResponse) {
        this.dialogRef.close(patient);
    }
}
