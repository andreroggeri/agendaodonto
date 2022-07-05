import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginator } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Mock, MockFactory } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DirectivesModule } from 'src/app/shared/directives/directives.module';
import { MaterialAppModule } from 'src/app/shared/material.app.module';
import { DentalPlanDatabase } from 'src/app/shared/testing/databases/dental-plan.database';

import { DentalPlanService } from '../dental-plan.service';
import { DentalPlanComponent } from './dental-plan.component';

describe('DentalPlanComponent', () => {
    const dentalPlanDb = new DentalPlanDatabase();
    let component: DentalPlanComponent;
    let fixture: ComponentFixture<DentalPlanComponent>;
    let dentalPlanService: Mock<DentalPlanService>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                DirectivesModule,
                MaterialAppModule,
                RouterTestingModule,
                NoopAnimationsModule,
            ],
            providers: [
                { provide: DentalPlanService, useFactory: () => dentalPlanService },
            ],
            declarations: [DentalPlanComponent],
        });
    });

    beforeEach(() => {
        dentalPlanService = MockFactory.create(DentalPlanService);
        fixture = TestBed.createComponent(DentalPlanComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('pagination', () => {
        it('should update the table data on page size change', () => {
            dentalPlanService._spy.getAll._func.and.returnValue(of(dentalPlanDb.getAsResponse(10)).pipe(delay(1)));

            fixture.detectChanges();

            const element = fixture.debugElement.query(By.css('mat-paginator'));
            const paginator = element.componentInstance as MatPaginator;
            paginator.pageSize = 100;
            paginator.page.next();
            fixture.detectChanges();

            expect(component.datasource.filter.getFilterValue('pageSize')).toEqual('100');
            expect(dentalPlanService.getAll).toHaveBeenCalledWith(component.datasource.filter);
        });
    });
});
