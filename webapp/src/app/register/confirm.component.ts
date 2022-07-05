import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material';
import { DentistService } from '../shared/services/dentist.service';

@Component({
    selector: 'app-confirm',
    template: '',
})
export class ConfirmComponent implements OnInit {

    constructor(
        private router: Router,
        private dentistService: DentistService,
        private route: ActivatedRoute,
        private snack: MatSnackBar) { }

    ngOnInit() {
        const uid = this.route.snapshot.params['uid'];
        const token = this.route.snapshot.params['token'];
        this.dentistService.activate(uid, token)
            .subscribe(
            _data => {
                this.snack.open('Conta ativada com sucesso !', 'Fechar');
                this.router.navigate(['/login']);
            },
            _error => {
                this.snack.open('Não foi possível ativar essa conta. Tente novamente', 'Fechar');
                this.router.navigate(['/login']);
            },
            );
    }

}
