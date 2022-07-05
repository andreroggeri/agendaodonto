import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { Observable } from 'rxjs';

import { IPagedResponse } from '../shared/interceptors/responses';
import { IDentalPlanResponse } from '../shared/interfaces/services/denta-plan.model';
import { BaseService } from '../shared/services/base.service';
import { DentalPlanFilter } from './dental-plan.filter';

@Injectable()
export class DentalPlanService extends BaseService {

    constructor(private http: HttpClient) {
        super();
    }

    get(planId: number): Observable<IDentalPlanResponse> {
        return this.http.get<IDentalPlanResponse>(this.url(['dental-plans', planId]));
    }

    getAll(dentalPlanFilter?: DentalPlanFilter): Observable<IPagedResponse<IDentalPlanResponse>> {
        const filter = dentalPlanFilter ? dentalPlanFilter : new DentalPlanFilter();
        return this.http.get<IPagedResponse<IDentalPlanResponse>>(this.url(['dental-plans']), filter.getFilter());
    }

    create(plan: IDentalPlanResponse) {
        return this.http.post<IDentalPlanResponse>(this.url(['dental-plans']), plan);
    }

    update(plan: IDentalPlanResponse) {
        if (!plan.id) {
            throw new Error('ID is required for updating a plan');
        }
        return this.http.put<IDentalPlanResponse>(this.url(['dental-plans', plan.id]), plan);
    }

    save(plan: IDentalPlanResponse) {
        if (plan.id) {
            return this.update(plan);
        } else {
            return this.create(plan);
        }
    }

    remove(plan: IDentalPlanResponse): Observable<null> {
        if (!plan.id) {
            throw new Error('ID is required for deleting a plan');
        }

        return this.http.delete<null>(this.url(['dental-plans', plan.id]));
    }

    getStats(startDate: Date, endDate: Date): Observable<IDentalPlanStats[]> {
        let params = new HttpParams();
        params = params.set('start_date', format(startDate, 'YYYY-MM-DD'));
        params = params.set('end_date', format(endDate, 'YYYY-MM-DD'));

        return this.http.get<IDentalPlanStats[]>(this.url(['dental-plans', 'stats']), { params });
    }
}

interface IDentalPlanStats {
    count: number;
    dental_plan: string;
}
