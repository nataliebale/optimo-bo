export enum HistoryPaymentMethods {
  Card = 1,
  Cash,
  PrePayment,
  Consignation,
  Return,
  Other = 9,
}

export const mapOfHistoryPaymentMethods = {
  [HistoryPaymentMethods.Card]: 'ბარათით ანგარიშსწორება',
  [HistoryPaymentMethods.Cash]: 'ნაღდი ანგარიშსწორება',
  [HistoryPaymentMethods.PrePayment]: 'წინასწარ გადახდა',
  [HistoryPaymentMethods.Consignation]: 'კონსიგნაცია',
  [HistoryPaymentMethods.Return]: 'უკან დაბრუნება',
  [HistoryPaymentMethods.Other]: 'სხვა',
};

export const pairOfHistoryPaymentMethods = [
  { value: HistoryPaymentMethods.Cash, label: 'ნაღდი ანგარიშსწორება' },
  { value: HistoryPaymentMethods.Card, label: 'ბარათით ანგარიშსწორება' },
  { value: HistoryPaymentMethods.PrePayment, label: 'წინასწარ გადახდა' },
  { value: HistoryPaymentMethods.Consignation, label: 'კონსიგნაცია' },
  { value: HistoryPaymentMethods.Return, label: 'უკან დაბრუნება' },
  { value: HistoryPaymentMethods.Other, label: 'სხვა' },
];
