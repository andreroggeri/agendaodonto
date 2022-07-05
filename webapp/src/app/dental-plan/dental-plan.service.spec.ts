import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'ng-bullet';
import { environment } from 'src/environments/environment';

import { DentalPlanDatabase } from '../shared/testing/databases/dental-plan.database';
import { DentalPlanService } from './dental-plan.service';

describe('DentalPlanService', () => {
    const dentalPlanDb = new DentalPlanDatabase();
    let service: DentalPlanService;
    let controller: HttpTestingController;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DentalPlanService],
        });
    });

    beforeEach(() => {
        service = TestBed.get(DentalPlanService);
        controller = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        controller.verify();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    describe('#get', () => {
        it('should fetch an specific dental plan', (done: DoneFn) => {
            const plan = dentalPlanDb.get();
            service.get(1).subscribe(
                response => {
                    expect(response).toEqual(plan);
                    done();
                },
            );
            const mock = controller.expectOne(`${environment.api}v1/dental-plans/1/`);

            mock.flush(plan);

            expect(mock.request.method).toEqual('GET');
        });
    });

    describe('#getAll', () => {
        it('should fetch all dental plans', (done: DoneFn) => {
            const plans = dentalPlanDb.getAsResponse(10);
            service.getAll().subscribe(
                response => {
                    expect(response).toEqual(plans);
                    done();
                },
            );

            const mock = controller.expectOne((req) => req.url === `${environment.api}v1/dental-plans/`);

            mock.flush(plans);

            expect(mock.request.method).toEqual('GET');
        });
    });

    describe('#create', () => {
        it('should create', (done: DoneFn) => {
            const plan = dentalPlanDb.get();
            service.create(plan).subscribe(
                response => {
                    expect(response).toEqual(plan);
                    done();
                },
            );

            const mock = controller.expectOne((req) => req.url === `${environment.api}v1/dental-plans/`);

            mock.flush(plan);

            expect(mock.request.method).toEqual('POST');
            expect(mock.request.body).toEqual(plan);
        });
    });

    describe('#update', () => {
        it('should update', (done: DoneFn) => {
            const plan = dentalPlanDb.get();
            service.update(plan).subscribe(
                response => {
                    expect(response).toEqual(plan);
                    done();
                },
            );

            const mock = controller.expectOne((req) => req.url === `${environment.api}v1/dental-plans/${plan.id}/`);

            mock.flush(plan);

            expect(mock.request.method).toEqual('PUT');
            expect(mock.request.body).toEqual(plan);
        });
    });

    describe('#save', () => {
        it('should call create if no id is supplied', () => {
            const plan = dentalPlanDb.get();
            delete plan.id;

            spyOn(service, 'create');
            service.save(plan);

            expect(service.create).toHaveBeenCalled();
        });

        it('should call update if id is supplied', () => {
            const plan = dentalPlanDb.get();

            spyOn(service, 'update');
            service.save(plan);

            expect(service.update).toHaveBeenCalled();
        });
    });

    describe('#remove', () => {
        it('should remove', () => {
            const plan = dentalPlanDb.get();
            service.remove(plan).subscribe();
            const mock = controller.expectOne(`${environment.api}v1/dental-plans/${plan.id}/`);

            mock.flush(null);

            expect(mock.request.method).toEqual('DELETE');
        });

        it('should throw an error if no id is supplied for the dental plan', () => {
            const plan = dentalPlanDb.get();
            delete plan.id;

            const call = () => {
                return service.remove(plan);
            };

            expect(call).toThrowError();
        });
    });
});
