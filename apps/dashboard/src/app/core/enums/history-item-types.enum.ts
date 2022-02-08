export enum HistoryItemTypes {
  Purchase = 1,
  Payment = 2,
  Return = 3,
}

export const mapOfHistoryItemTypes = {
  [HistoryItemTypes.Purchase]: 'შესყიდვა',
  [HistoryItemTypes.Payment]: 'ანგარიშსწორება',
  [HistoryItemTypes.Return]: 'უკან დაბრუნება',
};

export const pairOfHistoryItemTypes = [
  { value: HistoryItemTypes.Purchase, label: 'შესყიდვა' },
  { value: HistoryItemTypes.Payment, label: 'ანგარიშსწორება' },
  { value: HistoryItemTypes.Return, label: 'უკან დაბრუნება' },
];
