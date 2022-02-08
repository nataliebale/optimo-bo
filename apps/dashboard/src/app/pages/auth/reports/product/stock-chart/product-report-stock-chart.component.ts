import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { formatRFC3339, endOfToday, endOfMonth, startOfMonth } from 'date-fns';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';
import { Subject } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-report-stock-chart',
  templateUrl: './product-report-stock-chart.component.html',
  styleUrls: ['./product-report-stock-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReportStockChartComponent implements OnDestroy {
  private _stockItemId: number;

  @Input()
  set stockItemId(value: number) {
    this._stockItemId = value;
    this.getChartData();
  }

  get stockItemId(): number {
    return this._stockItemId;
  }

  endOfToday = endOfToday();
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
      dateFormats: [{ format: 'd', period: 'day' }],
      minGridDistance: 60,
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
        text: 'მარაგი',
        keyField: 'snapshotDateDay',
        valueField: 'quantityOnHand',
        tooltipText: '{quantityOnHand}',
        criticalValueField: 'lowStockThreshold',
        criticalValueColor: '#f672a7',
      },
      {
        type: ChartSeriesTypes.Line,
        color: '#8189eb',
        text: 'მინიმალური ზღვარი',
        keyField: 'snapshotDateDay',
        valueField: 'lowStockThreshold',
        bullets: true,
        tooltipText: '{lowStockThreshold}',
      },
    ],
  };

  mapOfExportTitles = {
    snapshotDateDay: 'თარიღი',
    quantityOnHand: 'მარაგი',
    lowStockThreshold: 'მინიმალური ზღვარი',
  };

  isDatePickerVisible: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getChartData() {
    this.clearData();
    this.unsubscribe$.next();
    if (!this.stockItemId || !this.dateRange) {
      return;
    }

    const dateFrom = formatRFC3339(this.dateRange[0]);
    const dateTo = formatRFC3339(this.dateRange[1]);

    this.client
      .get('warehouse/stockholdingshistory', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            stockItemId: this.stockItemId.toString(),
            snapshotDateFrom: dateFrom,
            snapshotDateTo: dateTo,
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
    this.dataSource = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
