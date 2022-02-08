export enum EntitySaleStatus {
  Draft = 0,
  Sold = 5,
  Uploaded = 55,
  Canceled = 9,
}

export const entitySaleStatusMap = {
  [EntitySaleStatus.Sold]: 'გაყიდული',
  [EntitySaleStatus.Uploaded]: 'ატვირთული',
  [EntitySaleStatus.Draft]: 'დრაფტი',
  [EntitySaleStatus.Canceled]: 'გაუქმებული',
};
