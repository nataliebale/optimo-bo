export enum SaleReturnReason {
  Damaged = 1,
  WrongPrice,
  WrongProduct,
  WrongQuantity,
  WrongRealization,
  Other = 99,
}

export const MapOfSaleReturnReasonLabels: Map<SaleReturnReason, string> = new Map([
  [SaleReturnReason.Damaged, 'Damaged'],
  [SaleReturnReason.WrongPrice, 'WrongPrice'],
  [SaleReturnReason.WrongProduct, 'WrongProduct'],
  [SaleReturnReason.WrongQuantity,'WrongQuantity'],
  [SaleReturnReason.WrongRealization,'WrongRealization'],
  [SaleReturnReason.Other, 'Other'],
])
