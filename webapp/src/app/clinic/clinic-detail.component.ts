import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { IDentistResponse } from '../shared/interfaces/services/dentist.model';
import { DentistService } from '../shared/services/dentist.service';
import { CustomFB, CustomFG } from '../shared/validation';
import { ClinicService } from './clinic.service';

@Component({
    selector: 'app-clinic-detail',
    templateUrl: './clinic-detail.component.html',
    styleUrls: ['./clinic-detail.component.scss'],
})
export class ClinicDetailComponent implements OnInit {
    clinicId: number;
    isLoading = true;
    isSubmitting = false;
    errors: string[];
    clinicForm: CustomFG;
    dentistCompleter = new FormControl();
    filteredOptions: Observable<IDentistResponse[]>;

    constructor(private clinicService: ClinicService,
                private dentistService: DentistService,
                private router: Router,
                private route: ActivatedRoute,
                public snackBar: MatSnackBar,
                public dialog: MatDialog) {
        this.clinicForm = new CustomFB().group({
            id: [''],
            name: ['', Validators.required],
            dentists: [[]],
        });
    }

    ngOnInit() {
        this.clinicId = +this.route.snapshot.params['id'];
        if (this.clinicId) {
            this.clinicService.get(this.clinicId).pipe(
                finalize(() => this.isLoading = false),
            ).subscribe(
                response => {
                    this.clinicForm.setValue({
                        id: response.id,
                        name: response.name,
                        dentists: response.dentists,
                    });
                },
            );
        } else {
            this.isLoading = false;
        }
        this.dentistCompleter.valueChanges
            .pipe(debounceTime(500))
            .subscribe(e => {
                if (e instanceof Object) {
                    this.addDentist(e);
                    this.dentistCompleter.setValue('');
                    this.filteredOptions = of();
                } else {
                    this.filteredOptions = this.dentistService.get(e);
                }
            },
            );
    }

    addDentist(dentist: IDentistResponse) {
        if (this.clinicForm.controls.dentists.value.map(d => d.id).indexOf(dentist.id) === -1) {
            this.clinicForm.controls.dentists.setValue(this.clinicForm.controls.dentists.value.concat(dentist));
        }
    }

    removeDentist(dentist: IDentistResponse) {
        this.clinicForm.controls.dentists.setValue(this.clinicForm.controls.dentists.value.filter((d) => {
            return d.id !== dentist.id;
        }));
    }

    displayDentist(dentist: IDentistResponse) {
        return dentist ? dentist.first_name + ' ' + dentist.last_name : '';
    }

    onSubmit() {
        this.isSubmitting = true;
        this.clinicService.save(this.clinicForm.value)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(
                _clinic => {
                    this.snackBar.open('Salvo com sucesso.', '', { duration: 2000 });
                    this.router.navigate(['clinicas']);
                },
                errors => {
                    this.snackBar.open('Não foi possível salvar.', '', { duration: 2000 });
                    this.clinicForm.pushFieldErrors(errors.error);
                });
    }

    onDelete() {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            height: '150px',
            data: {
                title: 'Você tem certeza disso ?',
                message: 'Ao apagar a Clinica, você também apagará ' +
                'todos os pacientes e agendamentos relacionados a ela. Deseja prosseguir?',
            },
        });

        dialog.afterClosed().subscribe(result => {
            if (result === 'true') {
                this.isSubmitting = true;
                this.clinicService.remove(this.clinicForm.value).subscribe(
                    () => {
                        this.snackBar.open('Clinica excluida.', '', { duration: 2000 });
                        this.router.navigate(['clinicas']);
                    },
                );
            }
        });
    }

}
