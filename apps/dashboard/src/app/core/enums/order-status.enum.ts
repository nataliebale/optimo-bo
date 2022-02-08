export enum OrderStatuses {
  Draft = 0,
  Ordered = 1,
  Received = 5,
  Deleted = 99,
  Canceled = 9,
  Delayed = -1
}

export const orderStatusData = {
  [OrderStatuses.Ordered]: 'შეკვეთილი',
  [OrderStatuses.Draft]: 'დრაფტი',
  [OrderStatuses.Received]: 'მიღებული',
  [OrderStatuses.Deleted]: 'წაშლილი',
  [OrderStatuses.Canceled]: 'გაუქმებული',
  [OrderStatuses.Delayed]: 'დაგვიანებული'
};
