import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TokenService } from '../shared/services/token.service';
import { CustomFB, CustomFG } from '../shared/validation';
import { LoginService } from './login.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    isLoading = false;
    loginForm: CustomFG;
    errors: string[] = [];

    constructor(private loginService: LoginService, private router: Router, private tokenService: TokenService) {
        this.loginForm = new CustomFB().group({
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    onSubmit() {
        this.isLoading = true;
        this.loginService.authenticate(this.loginForm.value).pipe(
            finalize(() => this.isLoading = false),
        ).subscribe(
            response => {
                this.tokenService.setToken(response.auth_token);
                this.loginService.getUserInfo();
                this.router.navigate(['/dashboard']);
            },
            errors => {
                if (errors.hasOwnProperty('non_field_errors')) {
                    this.errors = errors.non_field_errors;
                }
                this.loginForm.pushFieldErrors(errors.error);

            },
        );

    }

}
