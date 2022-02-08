export enum ProductionOrderStatus {
  Draft = 0,
  Succeeded = 5
}

export const PRODUCTION_ORDER_STATUS_DATA = {
  [ProductionOrderStatus.Succeeded]: 'დამზადებული',
  [ProductionOrderStatus.Draft]: 'დრაფტი'
};
