export enum HistoryItemStatus {
  Draft = 0,
  Enabled = 1,
  Disabled = 2,
  Deleted = 99,
}

export const mapOfHistoryItemStatus = {
  // [HistoryItemStatus.Draft]: 'დრაფტი',
  [HistoryItemStatus.Enabled]: 'აქტიური',
  [HistoryItemStatus.Disabled]: 'გაუქმებული',
  // [HistoryItemStatus.Deleted]: 'წაშლილი',
};

export const pairOfHistoryItemStatus = [
  { value: HistoryItemStatus.Draft, label: 'დრაფტი' },
  { value: HistoryItemStatus.Enabled, label: 'აქტიური' },
  { value: HistoryItemStatus.Disabled, label: 'გაუქმებული' },
  { value: HistoryItemStatus.Deleted, label: 'წაშლილი' },
];
