export enum HoldingType {
  RS,
  NonRS
}

export const mapOfHoldingTypes = [
  { value: HoldingType.RS, label: 'RS-ით დამოწმებული' },
  { value: HoldingType.NonRS, label: 'დაუმოწმებელი' }
];
