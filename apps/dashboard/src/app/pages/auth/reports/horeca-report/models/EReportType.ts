export enum EReportType {
  TotalRevenue = 1,
  TotalIncome = 2,
  TotalExpense = 3,
  TotalOrders = 4,
  TotalCustomers = 5,
  AvgOrderRevenue = 6,
}

export const ReportTypeTitles = new Map([
  [EReportType.TotalRevenue, 'GENERAL.INCOME'],
  [EReportType.TotalIncome, 'GENERAL.MARGIN'],
  [EReportType.TotalExpense, 'GENERAL.PURCHASES'],
  [EReportType.TotalOrders, 'GENERAL.TRANSACTIONS'],
  [EReportType.TotalCustomers, 'GENERAL.USER'],
  [EReportType.AvgOrderRevenue, 'STATISTICS.GENERAL.AVARAGE_CHEQUE'],
]);
