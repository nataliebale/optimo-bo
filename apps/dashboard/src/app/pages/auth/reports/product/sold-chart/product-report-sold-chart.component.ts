import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { endOfToday, formatRFC3339, startOfYear } from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';

enum Tab {
  revenue,
  quantity,
}
@Component({
  selector: 'app-product-report-sold-chart',
  templateUrl: './product-report-sold-chart.component.html',
  styleUrls: ['./product-report-sold-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReportSoldChartComponent implements OnDestroy {
  private _stockItemId: number;

  @Input()
  set stockItemId(value: number) {
    this._stockItemId = value;
    this.getChartData();
  }

  get stockItemId(): number {
    return this._stockItemId;
  }

  revenueSummaryData: any;

  revenueChartConfig: ChartConfig = {
    type: ChartTypes.XY,
    legend: true,
    cursor: true,
    xAxisConfig: {
      type: ChartAxisTypes.DateAxis,
      disableGrid: true,
      minGridDistance: 60,
    },
    yAxisConfig: {
      type: ChartAxisTypes.ValueAxis,
      disableGrid: true,
    },
    series: [
      {
        type: ChartSeriesTypes.Column,
        color: '#8189eb',
        text: 'ნაღდი',
        keyField: 'saleOrderDateDay',
        valueField: 'totalRevenueCashManual',
        tooltipText: '{totalRevenueCashManual}',
      },
      {
        type: ChartSeriesTypes.Column,
        color: '#e2e4fc',
        text: 'უნაღდო',
        keyField: 'saleOrderDateDay',
        valueField: 'totalRevenueCard',
        tooltipText: '{totalRevenueCard}',
        stacked: true,
      },
    ],
  };

  mapOfRevenueChartExportTitles = {
    saleOrderDateDay: 'თარიღი',
    totalRevenueCashManual: 'ნაღდი',
    totalRevenueCard: 'უნაღდო',
  };

  quantityChartConfig: ChartConfig = {
    type: ChartTypes.XY,
    legend: true,
    cursor: true,
    xAxisConfig: {
      type: ChartAxisTypes.DateAxis,
      disableGrid: true,
      minGridDistance: 60,
    },
    yAxisConfig: {
      type: ChartAxisTypes.ValueAxis,
      disableGrid: true,
    },
    series: [
      {
        type: ChartSeriesTypes.Column,
        color: '#8189eb',
        text: 'ნაღდი',
        keyField: 'saleOrderDateDay',
        valueField: 'quantitySoldCashManual',
        tooltipText: '{quantitySoldCashManual}',
      },
      {
        type: ChartSeriesTypes.Column,
        color: '#e2e4fc',
        text: 'უნაღდო',
        keyField: 'saleOrderDateDay',
        valueField: 'quantitySoldCard',
        tooltipText: '{quantitySoldCard}',
        stacked: true,
      },
    ],
  };

  mapOfQuantityChartExportTitles = {
    saleOrderDateDay: 'თარიღი',
    quantitySoldCashManual: 'ნაღდი',
    quantitySoldCard: 'უნაღდო',
  };

  revenueDataSource: any[];
  quantityDataSource: any[];

  endOfToday = endOfToday();
  private defaultDate = [startOfYear(Date.now()), this.endOfToday];

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

  tab = Tab;
  activeTab: Tab = Tab.revenue;
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
      .get<any>('sales/stockitemsalessummary', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: dateFrom,
            saleOrderDateTo: dateTo,
            stockItemId: `${this.stockItemId}`,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((revenueSummary) => {
        this.revenueSummaryData = revenueSummary;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/stockitemsalesquantitysoldbypaymentmethod', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            stockItemId: this.stockItemId.toString(),
            saleOrderDateFrom: dateFrom,
            saleOrderDateTo: dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        this.quantityDataSource = result;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/stockitemsalesrevenuebypaymentmethod', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            stockItemId: this.stockItemId.toString(),
            saleOrderDateFrom: dateFrom,
            saleOrderDateTo: dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any[]) => {
        this.revenueDataSource = result;
        this.cdr.markForCheck();
      });
  }

  onDateChanged(dateRange: Date[]): void {
    this.dateRange = dateRange;
    this.onToggleDatePicker();
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.cdr.markForCheck();
  }

  toggleTab(tab: Tab): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  private clearData(): void {
    this.revenueSummaryData = null;
    this.revenueDataSource = null;
    this.quantityDataSource = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
