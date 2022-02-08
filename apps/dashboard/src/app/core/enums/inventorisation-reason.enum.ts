export enum InventorisationReason {
  StocktakePlus = 5,
  StocktakeMinus = 6,
  Damage = 7,
  Loss = 8,
  Steal = 9
}

export const INVENTORISATION_REASONS_DATA = {
  [InventorisationReason.StocktakePlus]: 'ნამატი',
  [InventorisationReason.StocktakeMinus]: 'ზარალი',
  [InventorisationReason.Damage]: 'დაზიანება',
  [InventorisationReason.Loss]: 'დაკარგვა',
  [InventorisationReason.Steal]: 'მოპარვა'
};

export const MAP_OF_INVENTORISATION_REASONS = [
  { value: InventorisationReason.StocktakePlus, label: 'ნამატი' },
  { value: InventorisationReason.StocktakeMinus, label: 'ზარალი' },
  { value: InventorisationReason.Damage, label: 'დაზიანება' },
  { value: InventorisationReason.Loss, label: 'დაკარგვა' },
  { value: InventorisationReason.Steal, label: 'მოპარვა' }
];
