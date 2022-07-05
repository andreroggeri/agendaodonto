import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IPagedResponse } from '../shared/interceptors/responses';
import { IClinicResponse } from '../shared/interfaces/services/clinic.model';
import { BaseService } from '../shared/services/base.service';
import { ClinicFilter } from './clinic.filter';

export interface IClinicService {
    getAll(clinicFilter?: ClinicFilter): Observable<{ results: IClinicResponse[] }>;
    get(clinicId: number): Observable<IClinicResponse>;
    create(clinic: IClinicResponse);
    update(clinic: IClinicResponse);
    remove(clinic: IClinicResponse);
    save(clinic: IClinicResponse);
}

@Injectable()
export class ClinicService extends BaseService implements IClinicService {

    constructor(private http: HttpClient) {
        super();
    }

    getAll(clinicFilter?: ClinicFilter): Observable<IPagedResponse<IClinicResponse>> {
        const filter = clinicFilter ? clinicFilter : new ClinicFilter();
        return this.http.get<IPagedResponse<IClinicResponse>>(this.url(['clinics']), filter.getFilter());
    }

    get(clinicId: number): Observable<IClinicResponse> {
        return this.http.get<IClinicResponse>(this.url(['clinics', clinicId]));
    }

    create(clinic: IClinicResponse) {
        const data: any = clinic;
        data.dentists = data.dentists.map(dentist => dentist.id);
        return this.http.post<IClinicResponse>(this.url(['clinics']), JSON.stringify(data));
    }

    update(clinic: IClinicResponse) {
        const data: any = clinic;
        data.dentists = data.dentists.map(dentist => dentist.id);
        return this.http.put<IClinicResponse>(this.url(['clinics', clinic.id]), JSON.stringify(data));
    }

    remove(clinic: IClinicResponse) {
        return this.http.delete(this.url(['clinics', clinic.id]));
    }

    save(clinic: IClinicResponse) {
        if (clinic.id) {
            return this.update(clinic);
        } else {
            return this.create(clinic);
        }
    }
}
