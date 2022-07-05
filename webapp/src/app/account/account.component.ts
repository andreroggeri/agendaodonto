import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DentistService } from '../shared/services/dentist.service';
import { CustomFB, CustomFG } from '../shared/validation';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
    accountForm: CustomFG;
    states = [];
    isLoading = false;
    isSubmitting = false;

    constructor(private dentistService: DentistService, private snackBar: MatSnackBar) {
        const fb = new CustomFB();
        this.accountForm = fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: [''],
            cro: ['', Validators.required],
            cro_state: ['', Validators.required],
            sex: ['', Validators.required],
            sg_user: ['', Validators.required],
            sg_password: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.isLoading = true;
        forkJoin(
            this.dentistService.getStates(),
            this.dentistService.me())
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(response => {
                const states = response[0];
                const dentist = response[1];
                this.states = states;
                this.accountForm.setValue({
                    first_name: dentist.first_name,
                    last_name: dentist.last_name,
                    email: dentist.email,
                    cro: dentist.cro,
                    cro_state: dentist.cro_state,
                    sex: dentist.sex,
                });
            });
    }

    onSubmit() {
        this.isSubmitting = true;
        this.dentistService.update(this.accountForm.value)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(
                () => {
                    this.snackBar.open('Salvo com sucesso', '', { duration: 2000 });
                },
            );
    }

}
