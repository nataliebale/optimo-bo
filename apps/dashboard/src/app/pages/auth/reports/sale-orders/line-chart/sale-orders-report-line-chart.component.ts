import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { endOfToday, subDays, formatRFC3339 } from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';

@Component({
  selector: 'app-sale-orders-report-line-chart',
  templateUrl: './sale-orders-report-line-chart.component.html',
  styleUrls: ['./sale-orders-report-line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersReportLineChartComponent implements OnDestroy {
  dataSource: any;

  chartConfig: ChartConfig = {
    type: ChartTypes.XY,
    cursor: true,
    xAxisConfig: {
      endToEnd: true,
      title: 'პერიოდი',
      labelFontSize: 14,
      labelFontWeight: '100',
      labelRotation: 45,
      titleFontSize: 16,
      titleFontWeight: '600',
      type: ChartAxisTypes.DateAxis,
    },
    yAxisConfig: {
      title: 'რაოდენობა',
      labelFontSize: 14,
      labelFontWeight: '100',
      titleFontSize: 16,
      titleFontWeight: '600',
      type: ChartAxisTypes.ValueAxis,
    },
    series: [
      {
        type: ChartSeriesTypes.Line,
        color: '#2fcd8a',
        keyField: 'saleDateMax',
        valueField: 'ordersCount',
        text: 'ჩეკები',
      },
      {
        type: ChartSeriesTypes.Line,
        color: '#0077ff',
        keyField: 'saleDateMax',
        valueField: 'averageQuantitySold',
        text: 'პროდუქტები',
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
      .get('reports/saleorders/summary/grouped', {
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
