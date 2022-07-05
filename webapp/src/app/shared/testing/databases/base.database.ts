import { IPagedResponse } from '../../interceptors/responses';

export interface IDatabase<T> {
    get(): T;
    getMany(qty: number): T[];
}

export abstract class BaseDatabase<T> implements IDatabase<T> {
    abstract get(): T;

    getAsResponse(count: number): IPagedResponse<T> {
        return {
            count,
            results: this.getMany(count),
        };
    }

    getMany(qty: number): T[] {
        return new Array(qty).fill(null).map(() => this.get());
    }
}
