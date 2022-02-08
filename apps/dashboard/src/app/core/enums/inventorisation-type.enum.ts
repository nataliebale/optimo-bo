export enum InventorisationType {
  Full = 1,
  Partial
}

export const INVENTORISATION_TYPE_DATA = {
  [InventorisationType.Partial]: 'ნაწილობრივი',
  [InventorisationType.Full]: 'სრული'
};

export const MAP_OF_INVENTORISATION_TYPES = [
  { value: InventorisationType.Partial, label: 'ნაწილობრივი' },
  { value: InventorisationType.Full, label: 'სრული' }
];
