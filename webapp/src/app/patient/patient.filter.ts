import { BaseFilter } from '../shared/services/base.filter';

export class PatientFilter extends BaseFilter {

    constructor() {
        super();
        this.fields.push(
            { name: 'name', mapsTo: 'name', value: null, type: 'filter' },
            { name: 'phone', mapsTo: 'phone', value: null, type: 'filter' },
            { name: 'lastName', mapsTo: 'last_name', value: null, type: 'filter' },
            { name: 'fullName', mapsTo: 'full_name', value: null, type: 'filter' },
            { name: 'createdAfter', mapsTo: 'created_0', value: null, type: 'filter' },
            { name: 'createdBefore', mapsTo: 'created_1', value: null, type: 'filter' },
        );
        this.setFilterValue('orderBy', 'name');
    }
}
