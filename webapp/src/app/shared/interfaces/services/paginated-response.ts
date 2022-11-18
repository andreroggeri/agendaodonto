export interface IPaginatedResponse<T> {
    count: number;
    results: T[];
}
