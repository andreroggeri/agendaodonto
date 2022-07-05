import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { CustomFB, CustomFG, ValidationService } from '../shared/validation';

import { MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { DentistService } from '../shared/services/dentist.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    states = [];
    registerForm: CustomFG;
    isLoading = true;
    isSubmitting = false;
    errors: string[] = [];

    constructor(private dentistService: DentistService, private snackBar: MatSnackBar) {
        const fb = new CustomFB();
        this.registerForm = fb.group({
            email: ['', Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            cro: ['', Validators.required],
            cro_state: ['', Validators.required],
            sex: ['', Validators.required],
            password: fb.group({
                password: ['', Validators.required],
                confirm_password: ['', Validators.required],
            }, { validator: ValidationService.passwordCompareValidator }),
        });
    }

    ngOnInit() {
        this.dentistService.getStates().pipe(
            finalize(() => this.isLoading = false),
        ).subscribe(
            data => {
                this.states = data;
            });
    }

    onSubmit() {
        this.isSubmitting = true;
        this.errors = [];
        const dentist = this.registerForm.value;
        dentist.password = dentist.password.password;
        this.dentistService.create(dentist).pipe(
            finalize(() => this.isSubmitting = false),
        ).subscribe(
            _data => {
                this.registerForm.reset();
                this.snackBar.open('Conta criada com sucesso. Verifique o seu email !');
            },
            errors => {
                this.registerForm.pushFieldErrors(errors.error);
                if (errors.hasOwnProperty('non_field_errors')) {
                    this.errors = errors.non_field_errors;
                }
            });
    }

}
