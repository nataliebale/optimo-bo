export interface IChunkedResponse<T> {
    totalCount: number;
    data: T[];
}