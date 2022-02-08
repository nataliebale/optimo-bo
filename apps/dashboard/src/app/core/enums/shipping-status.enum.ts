export enum ShippingStatuses {
  Draft = 0,
  Shipped = 5,
  SucceededUploadedToRS = 55,
}

export const shippingStatusData = {
  [ShippingStatuses.Draft]: 'დრაფტი',
  [ShippingStatuses.Shipped]: 'გადაზიდული',
  [ShippingStatuses.SucceededUploadedToRS]: 'ატვირთული',
};
