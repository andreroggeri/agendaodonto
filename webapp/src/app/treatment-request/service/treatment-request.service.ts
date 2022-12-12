import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITreatmentRequestResponse } from 'src/app/shared/interfaces/services/treatment-request.response';
import { CrudService } from 'src/app/shared/services/crud.service';

@Injectable()
export class TreatmentRequestService extends CrudService<ITreatmentRequestResponse> {
    constructor(http: HttpClient) {
        super(http, 'treatment-requests');
    }
}
