import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Observable, ReplaySubject } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { IDentalPlanResponse } from '../shared/interfaces/services/denta-plan.model';
import { DentalPlanFilter } from './dental-plan.filter';
import { DentalPlanService } from './dental-plan.service';

export class DentalPlanDatasource extends DataSource<IDentalPlanResponse> {

    count = 0;
    update = new ReplaySubject<null>();
    isLoading = true;
    filter = new DentalPlanFilter();

    constructor(private dentalPlanService: DentalPlanService) {
        super();
    }

    connect(): Observable<IDentalPlanResponse[]> {
        return this.update.pipe(
            switchMap(() => {
                this.isLoading = true;
                return this.dentalPlanService.getAll(this.filter).pipe(
                    finalize(() => this.isLoading = false),
                    map(response => {
                        this.count = response.count;
                        return response.results;
                    }),
                );
            }),
        );
    }

    disconnect(collectionViewer: CollectionViewer): void {
    }

}
