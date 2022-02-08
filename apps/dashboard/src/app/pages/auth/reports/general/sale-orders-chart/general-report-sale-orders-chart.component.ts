import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { endOfMonth, formatRFC3339, startOfMonth, endOfToday } from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ClientService, Service } from '@optimo/core';
import { Subject } from 'rxjs';
import {
  ChartSeriesTypes,
  ChartAxisTypes,
  ChartConfig,
  ChartTypes,
} from '@optimo/ui-chart';

@Component({
  selector: 'app-general-report-sale-orders-chart',
  templateUrl: './general-report-sale-orders-chart.component.html',
  styleUrls: ['./general-report-sale-orders-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralReportSaleOrdersChartComponent
  implements OnInit, OnDestroy {
  endOfToday = endOfToday();
  revenueSummaryData: any;
  private defaultDate = [startOfMonth(Date.now()), this.endOfToday];

  private _dateRange: Date[] = this.defaultDate;

  set dateRange(value: Date[]) {
    if (!value) {
      value = this.defaultDate;
    }

    this._dateRange = value;
    this.getChartData();
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  dataSource: any;

  chartConfig: ChartConfig = {
    type: ChartTypes.XY,
    legend: true,
    cursor: true,
    xAxisConfig: {
      type: ChartAxisTypes.DateAxis,
      disableGrid: true,
    },
    yAxisConfig: {
      type: ChartAxisTypes.ValueAxis,
      disableGrid: true,
      minGridDistance: 30,
    },
    series: [
      {
        type: ChartSeriesTypes.Column,
        color: '#e2e4fc',
        text: 'ჩეკები',
        keyField: 'saleOrderDateDay',
        valueField: 'totalRevenue',
        tooltipText: '{totalRevenue}',
      },
      {
        type: ChartSeriesTypes.Line,
        color: '#8189eb',
        text: 'საშუალო ჩეკი',
        keyField: 'saleOrderDateDay',
        valueField: 'averageTotalRevenue',
        bullets: true,
        tooltipText: '{averageTotalRevenue}',
      },
    ],
  };

  mapOfExportTitles = {
    saleOrderDateDay: 'თარიღი',
    totalRevenue: 'ჩეკი',
    averageTotalRevenue: 'საშუალო ჩეკი',
  };

  isDatePickerVisible: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getChartData();
  }

  private getChartData() {
    this.clearData();
    this.unsubscribe$.next();
    if (!this.dateRange) {
      return;
    }

    const dateFrom = formatRFC3339(this.dateRange[0]);
    const dateTo = formatRFC3339(this.dateRange[1]);

    this.client
      .get('sales/salessummary', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: dateFrom,
            saleOrderDateTo: dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((revenueSummary) => {
        this.revenueSummaryData = revenueSummary;
        this.cdr.markForCheck();
      });

    this.client
      .get('sales/salesrevenueaveragerevenue', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: dateFrom,
            saleOrderDateTo: dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        this.dataSource = result;
        this.cdr.markForCheck();
      });
  }

  onDateChanged(start: Date): void {
    this.dateRange = start && [start, endOfMonth(start)];
    this.onToggleDatePicker();
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.cdr.markForCheck();
  }

  private clearData(): void {
    this.revenueSummaryData = null;
    this.dataSource = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
