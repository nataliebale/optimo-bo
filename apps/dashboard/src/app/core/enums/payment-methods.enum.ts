export enum PaymentMethods {
  PrePayment = 1,
  Consignation = 2,
  Other = 9,
}

export const mapOfPaymentMethods = [
  { value: PaymentMethods.PrePayment, label: 'წინასწარ გადახდა' },
  { value: PaymentMethods.Consignation, label: 'კონსიგნაცია' },
  { value: PaymentMethods.Other, label: 'სხვა' },
];

export enum EntitySaleOrderPaymentMethod {
  Cash = 1,
  Card,
  Consignation,
}

export const mapOfEntitySaleOrderPaymentMethods = {
  [EntitySaleOrderPaymentMethod.Cash]: 'ნაღდი ანგარიშსწორება',
  [EntitySaleOrderPaymentMethod.Card]: 'ბარათით გადახდა',
  [EntitySaleOrderPaymentMethod.Consignation]: 'კონსიგნაცია',
};

export const pairOfEntitySaleOrderPaymentMethods = [
  { value: EntitySaleOrderPaymentMethod.Cash, label: 'ნაღდი ანგარიშსწორება' },
  { value: EntitySaleOrderPaymentMethod.Card, label: 'ბარათით გადახდა' },
  { value: EntitySaleOrderPaymentMethod.Consignation, label: 'კონსიგნაცია' },
];
