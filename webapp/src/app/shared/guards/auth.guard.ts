import { CanActivate, Router } from '@angular/router';

import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { LoginService } from '../../login/login.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private loginService: LoginService, private router: Router, private snackBar: MatSnackBar) {
    }

    canActivate() {
        const status = this.loginService.isLogged();

        if (!status) {
            this.snackBar.open('Você precisa estar logado para visualizar esse menu.', '', { duration: 2000 });
            this.router.navigate(['/login']);
        }

        return status;
    }
}
