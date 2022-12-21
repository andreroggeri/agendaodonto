import { TestBed } from '@angular/core/testing';
import { Mock } from 'jasmine-mock-factory';
import { configureTestSuite } from 'ng-bullet';
import { of, ReplaySubject, throwError } from 'rxjs';
import { skip } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { PatientService } from 'src/app/patient/patient.service';
import { TreatmentRequestStatus } from 'src/app/shared/interfaces/services/treatment-request.response';
import { PatientDatabase } from 'src/app/shared/testing/databases/patient.database';
import { TreatmentRequestDatabase } from 'src/app/shared/testing/databases/treatment-request.database';
import { provideMock } from 'src/app/shared/testing/provide-mock';
import { TreatmentRequestService } from 'src/app/treatment-request/service/treatment-request.service';
import {
    initialState,
    ITreatmentRequestState,
    TreatmentRequestStateService,
} from 'src/app/treatment-request/service/treatment-request.state';

import { cloneAndUpdateAtPosition } from 'src/app/shared/testing/update-at-positiion';

describe('TreatmentRequestStateService', () => {
    const treatmentRequestDb = new TreatmentRequestDatabase();
    const patientDb = new PatientDatabase();

    const patients = patientDb.getAsResponse(5);
    const treatmentRequests = treatmentRequestDb.getAsResponse(5);

    let service: TreatmentRequestStateService;
    let subject$: ReplaySubject<ITreatmentRequestState>;
    let patientService: Mock<PatientService>;
    let treatmentRequestService: Mock<TreatmentRequestService>;
    let scheduler: TestScheduler;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                TreatmentRequestStateService,
                provideMock(TreatmentRequestService),
                provideMock(PatientService),
            ],
        });
    });

    beforeEach(() => {
        service = TestBed.get(TreatmentRequestStateService);
        service.reset();
        patientService = TestBed.get(PatientService);
        treatmentRequestService = TestBed.get(TreatmentRequestService);
        subject$ = new ReplaySubject<ITreatmentRequestState>();
        service.state$.subscribe(subject$);
        scheduler = new TestScheduler((actual, expected) => {
            console.log({ actual, expected });
            expect(actual).toEqual(expected);
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('fetchTreatmentRequests', () => {
        it('should load treatment requests', () => {
            treatmentRequestService._spy.list._func.and.returnValue(
                of(treatmentRequests),
            );
            const expectedMarbles = '(abc)';
            const expected: Record<string, ITreatmentRequestState> = {
                a: {
                    ...initialState,
                },
                b: {
                    ...initialState,
                    loading: true,
                },
                c: {
                    ...initialState,
                    count: treatmentRequests.count,
                    treatmentRequests: treatmentRequests.results.map((r) => {
                        return {
                            loading: false,
                            data: r,
                        };
                    }),
                },
            };

            scheduler.run(({ expectObservable }) => {
                service.fetchTreatmentRequests();
                expectObservable(subject$).toBe(expectedMarbles, expected);
            });
        });

        it('should emit error state if request fails', () => {
            treatmentRequestService._spy.list._func.and.returnValue(
                throwError('failed'),
            );
            const expectedMarbles = '(abcd)';
            const expected: Record<string, ITreatmentRequestState> = {
                a: {
                    ...initialState,
                },
                b: {
                    ...initialState,
                    loading: true,
                },
                c: {
                    ...initialState,
                    error: true,
                    loading: true,
                },
                d: {
                    ...initialState,
                    error: true,
                },
            };

            scheduler.run(({ expectObservable }) => {
                service.fetchTreatmentRequests();
                expectObservable(subject$).toBe(expectedMarbles, expected);
            });
        });
    });

    describe('updateTreatmentRequest', () => {
        it('should update treatment request', () => {
            treatmentRequestService._spy.list._func.and.returnValue(
                of(treatmentRequests),
            );
            service.fetchTreatmentRequests();

            const row = service.current.treatmentRequests[1];

            treatmentRequestService._spy.update._func.and.returnValue(
                of({
                    ...row.data,
                    status: TreatmentRequestStatus.READY,
                }),
            );

            const currentState = { ...service.current };
            const expectedMarbles = '(ab)';
            const expected: Record<string, ITreatmentRequestState> = {
                a: {
                    ...currentState,
                    treatmentRequests: cloneAndUpdateAtPosition(
                        1,
                        currentState.treatmentRequests,
                        {
                            loading: true,
                            data: {
                                ...row.data,
                            },
                        },
                    ),
                },
                b: {
                    ...currentState,
                    treatmentRequests: cloneAndUpdateAtPosition(
                        1,
                        currentState.treatmentRequests,
                        {
                            loading: false,
                            data: {
                                ...row.data,
                                status: TreatmentRequestStatus.READY,
                            },
                        },
                    ),
                },
            };

            scheduler.run(({ expectObservable }) => {
                service.updateTreatmentRequest(
                    row,
                    TreatmentRequestStatus.READY,
                );
                expectObservable(subject$.pipe(skip(3))).toBe(
                    expectedMarbles,
                    expected,
                );
            });
        });
    });

    describe('createPatientFromTreatmentRequest', () => {});
    describe('mergePatient', () => {});
    describe('paginate', () => {});
});
