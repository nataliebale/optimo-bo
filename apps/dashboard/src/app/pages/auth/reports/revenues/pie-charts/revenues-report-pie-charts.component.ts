import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';

@Component({
  selector: 'app-revenues-report-pie-charts',
  templateUrl: './revenues-report-pie-charts.component.html',
  styleUrls: ['./revenues-report-pie-charts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenuesReportPieChartsComponent implements OnInit, OnDestroy {
  profitDataSource: any;
  revenueDataSource: any;
  colors = [
    '#2fcd8a',
    '#0077ff',
    '#ff6383',
    '#ffcd56',
    '#4bc0c0',
    '#36a2eb',
    '#ff9f40',
  ];

  chartConfig: ChartConfig = {
    type: ChartTypes.Pie,
    legend: true,
    legendPosition: 'right',
    series: [
      {
        type: ChartSeriesTypes.Pie,
        colorField: 'color',
        keyField: 'name',
        valueField: 'value',
      },
    ],
  };

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getProfitPieChartData();
    this.getRevenuePieChartData();
  }

  private getProfitPieChartData(): void {
    this.client
      .get<any>('reports/saleorders/stockitems/income', {
        params: new HttpParams({
          fromObject: {
            take: '5',
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.profitDataSource = data.map((o, i) => {
          return {
            name: o.stockItemName,
            value: o.totalIncome,
            color: this.colors[i],
          };
        });
        this.cdr.markForCheck();
      });
  }

  private getRevenuePieChartData(): void {
    this.client
      .get<any>('reports/saleorders/stockitems/revenue', {
        params: new HttpParams({
          fromObject: {
            take: '5',
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.revenueDataSource = data.map((o, i) => {
          return {
            name: o.stockItemName,
            value: o.totalRevenue,
            color: this.colors[i],
          };
        });
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
