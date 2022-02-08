export enum InventorisationCriteria {
  Supplier = 1,
  Category = 2,
  StockItem = 3
}

export const INVENTORISATION_CRITERIAS_DATA = {
  [InventorisationCriteria.Supplier]: 'მომწოდებელი',
  [InventorisationCriteria.Category]: 'კატეგორია',
  [InventorisationCriteria.StockItem]: 'პროდუქტი'
};

export const MAP_OF_INVENTORISATION_CRITERIAS = [
  { label: 'მომწოდებელი', value: InventorisationCriteria.Supplier },
  { label: 'კატეგორია', value: InventorisationCriteria.Category },
  { label: 'პროდუქტი', value: InventorisationCriteria.StockItem }
];
