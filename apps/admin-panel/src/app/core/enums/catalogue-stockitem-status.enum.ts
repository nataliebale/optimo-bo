export const CATALOGUE_STOCKITEM_STATUS = [
  { value: 0, label: 'დრაფტი' },
  { value: 1, label: 'დადასტურებული' },
];

export enum CatalogueStockitemStatus {
  Draft = 0,
  Submitted = 1,
}

export const catalogueStockitemStatusData = {
  [CatalogueStockitemStatus.Draft]: 'დრაფტი',
  [CatalogueStockitemStatus.Submitted]: 'დადასტურებული',
};

export function getCatalogueStockitemStatus(status: number): string {
  switch (status) {
    case CatalogueStockitemStatus.Draft: {
      return 'დრაფტი';
    }
    case CatalogueStockitemStatus.Submitted: {
      return 'დადასტურებული';
    }
    default:
      return '';
  }
}
