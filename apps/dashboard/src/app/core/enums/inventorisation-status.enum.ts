export enum InventorisationStatus {
  Draft = 0,
  Succeeded = 5
}

export const INVENTORISATION_STATUS_DATA = {
  [InventorisationStatus.Draft]: 'დრაფტი',
  [InventorisationStatus.Succeeded]: 'დასრულებული'
};
