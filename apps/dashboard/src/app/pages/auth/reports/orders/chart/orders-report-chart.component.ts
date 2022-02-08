import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { endOfToday, subDays, formatRFC3339 } from 'date-fns';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';

@Component({
  selector: 'app-orders-report-chart',
  templateUrl: './orders-report-chart.component.html',
  styleUrls: ['./orders-report-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersReportChartComponent implements OnDestroy {
  dataSource: any;

  chartConfig: ChartConfig = {
    type: ChartTypes.XY,
    xAxisConfig: {
      endToEnd: true,
      title: 'პერიოდი',
      labelFontSize: 14,
      labelFontWeight: '100',
      labelRotation: 45,
      titleFontSize: 16,
      titleFontWeight: '600',
      type: ChartAxisTypes.DateAxis,
      minGridDistance: 0,
    },
    yAxisConfig: {
      title: 'შესყიდვების საშუალო ღირებულება',
      labelFontSize: 14,
      labelFontWeight: '100',
      titleFontSize: 16,
      titleFontWeight: '600',
      type: ChartAxisTypes.ValueAxis,
    },
    series: [
      {
        type: ChartSeriesTypes.Line,
        color: '#0077ff',
        keyField: 'receiveDate',
        valueField: 'receivedTotalCost',
        text: 'შესყიდვები',
      },
    ],
  };

  private selectedPeriod: number;
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getChartData(): void {
    this.unsubscribe$.next();
    if (!this.selectedPeriod) {
      return;
    }

    this.client
      .get('reports/purchaseorders/receivedtotalcost/grouped', {
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(subDays(endOfToday(), this.selectedPeriod)),
            dateTo: formatRFC3339(endOfToday()),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.dataSource = result;
        this.cdr.markForCheck();
      });
  }

  onStateChange({ period }): void {
    this.selectedPeriod = period;
    this.getChartData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
