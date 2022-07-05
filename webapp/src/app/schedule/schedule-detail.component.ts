import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog, MatSlideToggle, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { addMinutes, format } from 'date-fns';
import { Observable } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

import { PatientDetailComponent } from '../patient/patient-detail.component';
import { PatientFilter } from '../patient/patient.filter';
import { PatientService } from '../patient/patient.service';
import { BaseComponent } from '../shared/components/base.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { IDentistResponse } from '../shared/interfaces/services/dentist.model';
import { IPatientResponse } from '../shared/interfaces/services/patient.model';
import { IScheduleResponse } from '../shared/interfaces/services/schedule.model';
import { CustomFB, CustomFG } from '../shared/validation';
import { ScheduleService } from './schedule.service';

@Component({
    selector: 'app-schedule-detail',
    templateUrl: './schedule-detail.component.html',
    styleUrls: ['./schedule-detail.component.scss'],
})
export class ScheduleDetailComponent extends BaseComponent implements OnInit {
    isLoading = false;
    isSubmitting = false;
    scheduleForm: CustomFG;
    dentists: IDentistResponse[] = [];
    filteredPatients: Observable<{ results: IPatientResponse[] }> | null;
    scheduleId: number;
    schedule: IScheduleResponse;
    @ViewChild('continuousMode', { static: false }) continuousMode: MatSlideToggle;
    @ViewChild(FormGroupDirective, { static: true }) scheduleFormDirective: FormGroupDirective;

    constructor(
        private scheduleService: ScheduleService,
        private patientService: PatientService,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute) {
        super();
        this.scheduleForm = new CustomFB().group({
            id: [''],
            patient: ['', Validators.required],
            dentist: ['', Validators.required],
            date: ['', Validators.required],
            duration: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.scheduleId = +this.route.snapshot.params['id'];
        if (this.scheduleId) {
            this.loadScheduleData(this.scheduleId);
        }
        const filter = new PatientFilter();
        this.scheduleForm.controls.patient.valueChanges
            .pipe(debounceTime(100))
            .subscribe((value) => {
                if (typeof value === 'string') {
                    filter.setFilterValue('fullName', value);
                    this.filteredPatients = this.patientService.getAll(filter);
                } else {
                    if (value != null) {
                        this.dentists = value.clinic.dentists;
                        if (this.dentists.length === 1) {
                            this.scheduleForm.controls.dentist.setValue(this.dentists[0]);
                        }
                    }
                }

            });

    }

    displayPatient(patient: IPatientResponse) {
        if (patient) {
            return patient.name + ' ' + patient.last_name;
        } else {
            return '';
        }
    }

    onSubmit() {
        const scheduleDate = this.scheduleForm.controls.date.value;
        const scheduleDuration = this.scheduleForm.controls.duration.value;
        const nextScheduleDate = addMinutes(scheduleDate, scheduleDuration);
        this.isSubmitting = true;

        this.scheduleService.save(this.scheduleForm.value)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(() => {
                if (this.continuousMode && this.continuousMode.checked) {
                    this.scheduleFormDirective.resetForm();
                    this.scheduleForm.controls.id.setValue('');
                    this.scheduleForm.controls.date.setValue(format(nextScheduleDate, 'YYYY-MM-DDTHH:mm'));
                } else {
                    this.router.navigate(['/agenda']);
                }
            });
    }

    loadScheduleData(scheduleId: number) {
        this.isLoading = true;
        this.scheduleService.get(scheduleId).pipe(
            finalize(() => this.isLoading = false),
        ).subscribe(
            schedule => {
                this.schedule = schedule;
                this.dentists = schedule.patient.clinic.dentists;
                this.scheduleForm.setValue({
                    id: schedule.id,
                    patient: schedule.patient,
                    date: format(schedule.date, 'YYYY-MM-DDTHH:mm:ss.SSS'),
                    dentist: schedule.dentist,
                    duration: schedule.duration,
                });
            },
        );
    }

    onDelete() {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            height: '200px',
            width: '400px',
            data: {
                title: 'Você tem certeza disso ?',
                message: 'Deseja prosseguir?',
            },
        });

        dialog.afterClosed().subscribe(result => {
            if (result === 'true') {
                this.isSubmitting = true;
                this.scheduleService.remove(this.scheduleForm.value).subscribe(
                    () => {
                        this.snackBar.open('Agendamento excluido.', '', { duration: 2000 });
                        this.router.navigate(['/agenda']);
                    },
                );
            }
        });
    }

    patientSelected() {
        this.filteredPatients = null;
    }

    patientDialog() {
        this.dialog.open(PatientDetailComponent,
            { data: { patientId: this.scheduleForm.controls.patient.value.id } },
        );
    }
}
