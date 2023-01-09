import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPaginatedResponse } from 'src/app/shared/interfaces/services/paginated-response';
import { BaseFilter } from 'src/app/shared/services/base.filter';
import { BaseService } from 'src/app/shared/services/base.service';

type CreatedEntity<T> = T & { id: number };

export abstract class CrudService<T> extends BaseService {
    constructor(protected http: HttpClient, private endpoint: string) {
        super();
    }

    get(id: string): Observable<T> {
        return this.http.get<T>(this.url([this.endpoint, id]));
    }

    list(filter?: BaseFilter): Observable<IPaginatedResponse<T>> {
        const params = filter
            ? filter.getFilter()
            : new BaseFilter().getFilter();
        return this.http.get<IPaginatedResponse<T>>(
            this.url([this.endpoint]),
            params,
        );
    }

    create(data: T): Observable<T> {
        return this.http.post<T>(this.url([this.endpoint]), data);
    }

    update(data: CreatedEntity<T>): Observable<T> {
        return this.http.put<T>(this.url([this.endpoint, data.id]), data);
    }

    delete(data: CreatedEntity<T>): Observable<T> {
        return this.http.delete<T>(this.url([this.endpoint, data.id]));
    }
}
