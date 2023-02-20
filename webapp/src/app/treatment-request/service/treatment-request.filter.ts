import { BaseFilter } from 'src/app/shared/services/base.filter';
import { IFilterField } from 'src/app/shared/services/base.service';

export class TreatmentRequestFilter extends BaseFilter {
    fields: IFilterField[] = [
        { name: 'offset', mapsTo: 'offset', value: '0', type: 'other' },
        { name: 'pageSize', mapsTo: 'limit', value: '10', type: 'other' },
        { name: 'orderBy', mapsTo: 'ordering', value: 'id', type: 'other' },
        { name: 'status', mapsTo: 'status', value: null, type: 'filter' },
    ];
}
