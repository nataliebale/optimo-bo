export interface IViewAttributeItem {
  title: string;
  value: string | number;
  type?: ViewAttributeType;
}

export enum ViewAttributeType {
  text = 'text',
  number = 'number',
  decimalDot2 = 'decimalDot2',
  decimalDot4 = 'decimalDot4',
  date = 'date',
  longDate = 'longDate',
  dateTime = 'dateTime',
  longDateTime = 'longDateTime',
  currency = 'currency',
}
