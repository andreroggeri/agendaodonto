
import { environment } from '../../../environments/environment';

export abstract class BaseService {
    static BASE_URL = environment.api;
    static API_VERSION = 'v1/';
    static API_ENDPOINT = BaseService.BASE_URL + BaseService.API_VERSION;
    static API_AUTH_URL = BaseService.BASE_URL + 'auth/';

    url(blocks: Array<string | number| undefined>): string {
        let final = BaseService.API_ENDPOINT;
        blocks.forEach((u) => {
            final = final.concat(String(u) + '/');
        });

        return final;
    }
}

type fieldType = 'filter' | 'other';

export interface IFilterField {
    mapsTo: string;
    value: string | null;
    name: string;
    type: fieldType;
}
