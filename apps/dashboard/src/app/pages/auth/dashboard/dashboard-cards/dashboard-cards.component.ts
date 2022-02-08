import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { subDays, formatRFC3339 } from 'date-fns';
import {
  ChartAxisTypes,
  ChartConfig,
  ChartSeriesTypes,
  ChartTypes,
} from '@optimo/ui-chart';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-cards',
  templateUrl: './dashboard-cards.component.html',
  styleUrls: ['./dashboard-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardsComponent implements OnDestroy {
  private _dateRange: Date[];

  @Input()
  set dateRange(value: Date[]) {
    this._dateRange = value;
    this.clearData();
    if (value) {
      this.getDateDependentData();
    }
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  private greenColor = '#26d4a3';
  private redColor = '#f96257';
  private blueColor = '#4563ff';
  private pinkColor = '#f11a5e';

  revenueDetailsData: any;
  incomeDetailsData: any;
  stockitemsDataSource: any;
  revenueByMethodDataSource: any;

  math = Math;

  revenueChartConfig: ChartConfig = {
    type: ChartTypes.XY,
    xAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.DateAxis,
    },
    yAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.ValueAxis,
      minGridDistance: 2,
      // gridMinValue: -100,
    },
    series: [
      {
        type: ChartSeriesTypes.Column,
        keyField: 'saleOrderDateDay',
        valueField: 'totalRevenue',
        color: this.blueColor,
        columnRadius: 2,
        hidden: true,
        tooltipText: '{totalRevenue}',
      },
    ],
  };

  incomeChartConfig: ChartConfig = {
    type: ChartTypes.XY,
    xAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.DateAxis,
      minGridDistance: 0,
    },
    yAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.ValueAxis,
      minGridDistance: 2,
    },
    series: [
      {
        type: ChartSeriesTypes.Column,
        keyField: 'saleOrderDateDay',
        valueField: 'totalIncome',
        columnRadius: 2,
        color: this.pinkColor,
        hidden: true,
        tooltipText: '{totalIncome}',
      },
    ],
  };

  revenueByMethodChartConfig: ChartConfig = {
    type: ChartTypes.Pie,
    innerRadius: 50,
    xAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.DateAxis,
    },
    yAxisConfig: {
      hidden: true,
      type: ChartAxisTypes.ValueAxis,
    },
    series: [
      {
        type: ChartSeriesTypes.Pie,
        keyField: 'name',
        valueField: 'value',
        colorField: 'color',
        text: '',
      },
    ],
  };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {}

  private getDateDependentData(): void {
    const saleOrderDateFrom = formatRFC3339(this.dateRange[0]);
    const saleOrderDateTo = formatRFC3339(this.dateRange[1]);

    this.client
      .get<any>('sales/dashboard/salesrevenuedetails', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom,
            saleOrderDateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((revenueDetails) => {
        this.revenueDetailsData = revenueDetails;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/dashboard/salesincomedetails', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom,
            saleOrderDateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((incomeDetails) => {
        this.incomeDetailsData = incomeDetails;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/dashboard/salessummarybypaymentmethod', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom,
            saleOrderDateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((revenueByMethods: any) => {
        const {
          totalRevenueCashManual,
          totalRevenueCard,
          totalRevenueConsignation,
        } = revenueByMethods;

        this.revenueByMethodDataSource = [
          {
            value: totalRevenueCard,
            name: 'უნაღდო',
            color: this.redColor,
          },
          {
            value: totalRevenueCashManual,
            name: 'ნაღდი',
            color: this.greenColor,
          },
          {
            value: totalRevenueConsignation,
            name: 'კონსიგნაცია',
            color: '#6d48c8',
          },
        ];
        this.cdr.markForCheck();
      });

    this.getDateChartsData();
  }

  private getDateChartsData(): void {
    this.client
      .get<any>('sales/salessummaryhistory', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: formatRFC3339(subDays(this.dateRange[0], 6)),
            // saleOrderDateFrom: formatRFC3339(this.dateRange[0]),
            saleOrderDateTo: formatRFC3339(this.dateRange[1]),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.stockitemsDataSource = result;
        this.revenueChartConfig.yAxisConfig.gridMinValue = undefined;
        this.incomeChartConfig.yAxisConfig.gridMinValue = undefined;
        // this.stockitemsDataSource = [
        //   {"saleOrderDateDay":"2021-05-08T00:00:00+00:00","totalRevenue":100,"totalIncome":30},
        //   {"saleOrderDateDay":"2021-05-09T00:00:00+00:00","totalRevenue":200,"totalIncome":50},
        //   {"saleOrderDateDay":"2021-05-10T00:00:00+00:00","totalRevenue":300,"totalIncome":40},
        //   {"saleOrderDateDay":"2021-05-11T00:00:00+00:00","totalRevenue":100,"totalIncome":44},
        //   {"saleOrderDateDay":"2021-05-12T00:00:00+00:00","totalRevenue":200,"totalIncome":15},
        //   {"saleOrderDateDay":"2021-05-13T00:00:00+00:00","totalRevenue":300,"totalIncome":3},
        //   {"saleOrderDateDay":"2021-05-14T00:00:00+00:00","totalRevenue":-100,"totalIncome":-100},
        // ] // for testing
        console.log('dev => 123');
        const minRevenue = this.stockitemsDataSource.reduce(
          (accumulator: number, item: { totalRevenue: number }) =>
            item.totalRevenue < accumulator ? item.totalRevenue : accumulator,
          0
        );
        const minIncome = this.stockitemsDataSource.reduce(
          (accumulator: number, item: { totalIncome: number }) =>
            item.totalIncome < accumulator ? item.totalIncome : accumulator,
          0
        );
        setTimeout((_) => {
          // all this crap is for reRendering charts because config needs to be changed
          this.revenueChartConfig.yAxisConfig.gridMinValue = minRevenue;
          this.incomeChartConfig.yAxisConfig.gridMinValue = minIncome;
          this.cdr.markForCheck();
        });
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.revenueDetailsData = null;
    this.incomeDetailsData = null;
    this.revenueByMethodDataSource = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
