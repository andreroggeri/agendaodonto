import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { CustomFB, CustomFG } from 'src/app/shared/validation';

import { DentalPlanService } from '../dental-plan.service';

@Component({
    selector: 'app-dental-plan-detail',
    templateUrl: './dental-plan-detail.component.html',
    styleUrls: ['./dental-plan-detail.component.scss'],
})
export class DentalPlanDetailComponent implements OnInit {
    isLoading = false;
    isSubmitting = false;
    dentalPlanForm: CustomFG;
    dentalPlanId: number;

    constructor(
        private dentalPlanService: DentalPlanService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
    ) {
        this.dentalPlanForm = new CustomFB().group({
            id: [''],
            name: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.dentalPlanId = +this.route.snapshot.params['id'];

        if (this.dentalPlanId) {
            this.loadPlanData();
        }
    }

    submit() {
        this.isSubmitting = true;
        this.dentalPlanService.save(this.dentalPlanForm.value).pipe(
            finalize(() => this.isSubmitting = false),
        ).subscribe(
            result => {
                this.snackbar.open(`${result.name} salvo com sucesso`, 'Fechar', { duration: 2000 });
                this.router.navigate(['planos']);
            },
            err => {
                this.snackbar.open('Não foi possível salvar, tente novamente', 'Fechar', { duration: 2000 });
                console.error(err);
            },
        );
    }

    delete() {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
            height: '150px',
            data: {
                title: 'Você tem certeza disso ?',
                message: 'Ao apagar o Plano, você também apagará todos os seus pacientes. Deseja prosseguir?',
            },
        });

        dialog.afterClosed().subscribe((result) => {
            if (result === 'true') {
                this.isSubmitting = true;
                this.dentalPlanService.remove(this.dentalPlanForm.value).pipe(
                    finalize(() => this.isSubmitting = false),
                ).subscribe(
                    response => {
                        this.snackbar.open('Plano excluído com sucesso !', 'Fechar', { duration: 2000 });
                        this.router.navigate(['planos']);
                    },
                    err => {
                        this.snackbar.open('Não foi possível excluir, tente novamente', 'Fechar', { duration: 2000 });
                        console.error(err);
                    },
                );
            }
        });
    }

    private loadPlanData() {
        this.isLoading = true;
        this.dentalPlanService.get(this.dentalPlanId)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(response => {
                this.dentalPlanForm.setValue({
                    id: response.id,
                    name: response.name,
                });
            });
    }

}
