import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITreatmentRequestResponse } from 'src/app/shared/interfaces/services/treatment-request.response';
import { BaseFilter } from 'src/app/shared/services/base.filter';
import { IFilterField } from 'src/app/shared/services/base.service';
import { CrudService } from 'src/app/shared/services/crud.service';

export class TreatmentRequestFilter extends BaseFilter {
    fields: IFilterField[] = [
        { name: 'offset', mapsTo: 'offset', value: '0', type: 'other' },
        { name: 'pageSize', mapsTo: 'limit', value: '10', type: 'other' },
        { name: 'orderBy', mapsTo: 'ordering', value: 'id', type: 'other' },
        { name: 'status', mapsTo: 'status', value: null, type: 'filter' },
    ];
}
@Injectable()
export class TreatmentRequestService extends CrudService<ITreatmentRequestResponse> {
    constructor(http: HttpClient) {
        super(http, 'treatment-requests');
    }

    requestTreatment(treatmentRequest: ITreatmentRequestResponse) {
        const url = this.url([
            'treatment-requests',
            treatmentRequest.id,
            'submit',
        ]);
        return this.http.post<void>(url, treatmentRequest);
    }
}
