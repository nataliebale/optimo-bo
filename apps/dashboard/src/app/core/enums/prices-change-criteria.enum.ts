export enum PricesChangeCriteria {
  Supplier = 1,
  Category = 2,
  StockItem = 3
}

export const PRICES_CHANGE_CRITERIAS_DATA = {
  [PricesChangeCriteria.Supplier]: 'მომწოდებელი',
  [PricesChangeCriteria.Category]: 'კატეგორია',
  [PricesChangeCriteria.StockItem]: 'პროდუქტი'
};

export const MAP_OF_PRICES_CHANGE_CRITERIAS = [
  { label: 'მომწოდებელი', value: PricesChangeCriteria.Supplier },
  { label: 'კატეგორია', value: PricesChangeCriteria.Category },
  { label: 'პროდუქტი', value: PricesChangeCriteria.StockItem }
];
