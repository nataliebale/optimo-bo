import { Pipe, PipeTransform } from '@angular/core';
import { IReportTab, EReportType } from '../../models';

@Pipe({
  name: 'percentage',
})
export class PercentagePipe implements PipeTransform {
  transform(profit: number, reportTabs: IReportTab[]): number {
    const income: number = reportTabs.find(
      (tab: IReportTab) => tab.type === EReportType.TotalRevenue
    ).value;
    return Math.round((profit * 100) / income) || 0;
  }
}
