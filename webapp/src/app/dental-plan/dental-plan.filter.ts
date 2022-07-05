import { BaseFilter } from '../shared/services/base.filter';

export class DentalPlanFilter extends BaseFilter {
    constructor() {
        super();
        this.fields.push(
            { name: 'name', mapsTo: 'name', type: 'filter', value: '' },
        );
    }
}
