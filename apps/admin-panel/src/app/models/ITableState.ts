export interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}