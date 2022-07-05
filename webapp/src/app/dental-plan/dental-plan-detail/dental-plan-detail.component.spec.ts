import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Mock, MockFactory } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { of, throwError } from 'rxjs';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { MaterialAppModule } from 'src/app/shared/material.app.module';
import { DentalPlanDatabase } from 'src/app/shared/testing/databases/dental-plan.database';

import { DentalPlanService } from '../dental-plan.service';
import { DentalPlanDetailComponent } from './dental-plan-detail.component';

describe('DentalPlanDetailComponent', () => {
    const dentalPlanDb = new DentalPlanDatabase();
    let component: DentalPlanDetailComponent;
    let fixture: ComponentFixture<DentalPlanDetailComponent>;
    let dentalPlanService: Mock<DentalPlanService>;
    let route: Mock<ActivatedRoute>;
    let router: Router;
    let snackbar: MatSnackBar;
    let dialog: Mock<MatDialog>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                RouterTestingModule,
                NoopAnimationsModule,
                DirectivesModule,
                ReactiveFormsModule,
            ],
            declarations: [DentalPlanDetailComponent],
            providers: [
                { provide: DentalPlanService, useFactory: () => dentalPlanService },
                { provide: ActivatedRoute, useFactory: () => route },
                { provide: MatDialog, useFactory: () => dialog },
            ],
        });
    });

    beforeEach(async(() => {
        dentalPlanService = MockFactory.create(DentalPlanService);
        dialog = MockFactory.create(MatDialog);
        route = MockFactory.create(ActivatedRoute);
        router = TestBed.get(Router);
        snackbar = TestBed.get(MatSnackBar);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DentalPlanDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('#ngOnInit', () => {
        it('should load the plan data if there is a plan id on the url', () => {
            const plan = dentalPlanDb.get();
            route._spy.snapshot._get.and.returnValue({ params: { id: 10 } });
            dentalPlanService._spy.get._func.and.returnValue(of(plan));

            fixture.detectChanges();

            expect(dentalPlanService.get).toHaveBeenCalledTimes(1);
            expect(dentalPlanService.get).toHaveBeenCalledWith(10);
            expect(component.dentalPlanForm.value).toEqual({
                id: plan.id,
                name: plan.name,
            });
        });
    });

    describe('#submit', () => {
        it('should save the form data on submit and redirect to plan list view', () => {
            const plan = dentalPlanDb.get();
            dentalPlanService._spy.save._func.and.returnValue(of(plan));
            spyOn(router, 'navigate');
            spyOn(snackbar, 'open');

            component.submit();

            expect(router.navigate).toHaveBeenCalledWith(['planos']);
            expect(snackbar.open).toHaveBeenCalledWith(`${plan.name} salvo com sucesso`, 'Fechar', { duration: 2000 });
        });

        it('should show error snackbar if and error occurs during submission', () => {
            dentalPlanService._spy.save._func.and.returnValue(throwError(''));
            spyOn(router, 'navigate');
            spyOn(snackbar, 'open');

            component.submit();

            expect(router.navigate).not.toHaveBeenCalled();
            expect(snackbar.open).toHaveBeenCalledWith('Não foi possível salvar, tente novamente', 'Fechar', { duration: 2000 });
        });
    });

    describe('#delete', () => {
        it('should remove the plan if the dialog and show the success snackbar if closed by clicking on yes', () => {
            const plan = dentalPlanDb.get();
            dialog._spy.open._func.and.returnValue({ afterClosed: () => of('true') });
            dentalPlanService._spy.remove._func.and.returnValue(of(null));
            component.dentalPlanForm.setValue(plan);
            spyOn(snackbar, 'open');
            spyOn(router, 'navigate');

            component.delete();

            expect(snackbar.open).toHaveBeenCalledWith('Plano excluído com sucesso !', 'Fechar', { duration: 2000 });
            expect(router.navigate).toHaveBeenCalledWith(['planos']);
            expect(dentalPlanService.remove).toHaveBeenCalledWith(plan);
        });

        it('should remove the plan if the dialog and show the error snackbar if closed by clicking on yes', () => {
            const plan = dentalPlanDb.get();
            dialog._spy.open._func.and.returnValue({ afterClosed: () => of('true') });
            dentalPlanService._spy.remove._func.and.returnValue(throwError(''));
            component.dentalPlanForm.setValue(plan);
            spyOn(snackbar, 'open');
            spyOn(router, 'navigate');

            component.delete();

            expect(snackbar.open).toHaveBeenCalledWith('Não foi possível excluir, tente novamente', 'Fechar', { duration: 2000 });
            expect(router.navigate).not.toHaveBeenCalled();
            expect(dentalPlanService.remove).toHaveBeenCalledWith(plan);
        });

        it('not should remove the plan if the dialog if closed by clicking on no', () => {
            dialog._spy.open._func.and.returnValue({ afterClosed: () => of('false') });
            spyOn(snackbar, 'open');
            spyOn(router, 'navigate');

            component.delete();

            expect(snackbar.open).not.toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
            expect(dentalPlanService.remove).not.toHaveBeenCalled();
        });
    });
});
