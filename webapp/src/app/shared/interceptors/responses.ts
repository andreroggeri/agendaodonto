export interface IPagedResponse<T> {
    count: number;
    results: T[];
}
