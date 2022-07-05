import { BaseFilter } from '../shared/services/base.filter';

export class ScheduleFilter extends BaseFilter {
    constructor() {
        super();
        this.fields.push(
            { name: 'startDate', mapsTo: 'date_after', value: null, type: 'filter' },
            { name: 'endDate', mapsTo: 'date_before', value: null, type: 'filter' },
            { name: 'status', mapsTo: 'status', value: null, type: 'filter' },
        );
        this.setFilterValue('orderBy', 'date');
    }
}
