import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IDentistResponse } from '../interfaces/services/dentist.model';
import { BaseService } from './base.service';

export interface IDentistService {
    get(cro: string): Observable<IDentistResponse[]>;
    create(dentist: IDentistResponse): Observable<IDentistResponse[]>;
    activate(uid, token): Observable<any>;
    getStates(): Observable<any>;
}

@Injectable()
export class DentistService extends BaseService implements IDentistService {
    constructor(private http: HttpClient) {
        super();
    }

    get(cro: string): Observable<IDentistResponse[]> {
        return this.http.get(this.url(['dentists']) + '?cro=' + cro)
            .pipe(map((data: any) => data.results));
    }

    create(dentist: IDentistResponse): Observable<IDentistResponse[]> {
        return this.http.post<IDentistResponse[]>(BaseService.API_AUTH_URL + 'register/', JSON.stringify(dentist));
    }

    activate(uid, token): Observable<any> {
        const body = { uid, token };
        return this.http.post(BaseService.API_AUTH_URL + 'activate/', JSON.stringify(body));
    }

    getStates(): Observable<any> {
        return this.http.options(BaseService.API_AUTH_URL + 'register/').pipe(
            map((data: any) => data.actions.POST.cro_state.choices),
        );
    }

    me(): Observable<IDentistResponse> {
        return this.http.get<IDentistResponse>(this.url(['dentists', 'me']));
    }

    update(dentist: IDentistResponse): Observable<IDentistResponse> {
        return this.http.put<IDentistResponse>(this.url(['dentists', 'me']), JSON.stringify(dentist));
    }
}
