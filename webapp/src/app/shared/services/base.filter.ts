import { HttpParams } from '@angular/common/http';
import { IFilterField } from './base.service';
export abstract class BaseFilter {
    fields: IFilterField[] = [
        { name: 'offset', mapsTo: 'offset', value: '0', type: 'other' },
        { name: 'pageSize', mapsTo: 'limit', value: '10', type: 'other' },
        { name: 'orderBy', mapsTo: 'ordering', value: 'id', type: 'other' },
    ];
    setFilterValue(filterName: string, value: string, clearPrevious = false) {
        const filterIndex = this.fields.findIndex((e) => e.name === filterName);
        if (clearPrevious) {
            this.fields.filter((field) => field.type === 'filter').map((field) => field.value = null);
        }
        if (filterIndex === -1) {
            console.error('You are setting a unexisting field:', filterName);
            return;
        }
        this.fields[filterIndex].value = value;
    }

    getFilterValue(name: string): string | null {
        const filterIndex = this.fields.findIndex((e) => e.name === name);

        if (filterIndex === -1) {
            console.error('You are getting a unexisting field:', name);
            return null;
        }

        return this.fields[filterIndex].value;
    }

    getFilter(): {
        params: HttpParams;
    } {
        let params = new HttpParams();
        this.fields.forEach((field) => {
            if (field.value !== null && field.value !== undefined) {
                params = params.set(field.mapsTo, field.value);
            }
        });
        return { params };
    }
    reset() {
        this.fields
            .filter((field) => field.type === 'filter')
            .forEach((field) => field.value = '');
    }
}
