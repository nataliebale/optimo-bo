export enum PricesChangeType {
  PriceChange,
  Sale
}

export const MAP_OF_PRICES_CHANGE_TYPES = [
  { value: PricesChangeType.PriceChange, label: 'ფასის ცვლილება' },
  { value: PricesChangeType.Sale, label: 'ფასდაკლება' }
];

export const PRICES_CHANGE_TYPES_DATA = {
  [PricesChangeType.PriceChange]: 'ფასის ცვლილება',
  [PricesChangeType.Sale]: 'ფასდაკლება'
};
