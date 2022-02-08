import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';
import { endOfToday, startOfYear, formatRFC3339 } from 'date-fns';
import { Subject } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

enum Tab {
  revenue,
  quantity,
}

@Component({
  selector: 'app-general-report-sold-chart',
  templateUrl: './general-report-sold-chart.component.html',
  styleUrls: ['./general-report-sold-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralReportSoldChartComponent implements OnInit, OnDestroy {
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
      minGridDistance: 30,
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
      minGridDistance: 30,
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
      .get<any>('sales/salessummary', {
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
      .get<any>('sales/salesrevenuebypaymentmethod', {
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
        this.revenueDataSource = result;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/salesquantitysoldbypaymentmethod', {
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
        this.quantityDataSource = result;
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
