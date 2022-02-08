import { Pipe, PipeTransform } from '@angular/core';
import { IReportTab, EReportType } from '../../models';

@Pipe({
  name: 'isMoney',
})
export class IsMoneyPipe implements PipeTransform {
  transform(item: IReportTab): string {
    const moneyType: EReportType[] = [
      EReportType.AvgOrderRevenue,
      EReportType.TotalIncome,
      EReportType.TotalRevenue,
      EReportType.TotalExpense,
    ];
    return moneyType.includes(item.type) ? `₾` : ``;
  }
}
