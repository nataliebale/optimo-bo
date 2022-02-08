import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';

@Component({
  selector: 'app-sale-orders-report-pie-chart',
  templateUrl: './sale-orders-report-pie-chart.component.html',
  styleUrls: ['./sale-orders-report-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersReportPieChartComponent implements OnDestroy {
  dataSource: any;

  private selectedPeriod: number;
  private singleProductColor = '#2fcd8a';
  private multipleProductColor = '#0077ff';
  private unsubscribe$ = new Subject<void>();

  chartConfig: ChartConfig = {
    type: ChartTypes.Pie,
    innerRadius: 50,
    legend: true,
    legendPosition: 'right',
    cursor: true,
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
      },
    ],
  };

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getChartData(): void {
    this.unsubscribe$.next();
    if (!this.selectedPeriod) {
      return;
    }

    this.client
      .get<any>('reports/saleorders/orderlines/volume', {
        params: new HttpParams({
          fromObject: {
            daysPast: this.selectedPeriod.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        const singleProduct = {
          value: result.saleOrdersWithOneOrderLine,
          name: 'ერთ პროდუქტიანი',
          color: this.singleProductColor,
        };
        const multipleProduct = {
          value: result.saleOrdersWithMoreThanOneOrderLine,
          name: 'რამდენიმე პროდუქტიანი',
          color: this.multipleProductColor,
        };

        this.dataSource = [singleProduct, multipleProduct];
        console.log(
          'TCL: SaleOrdersReportPieChartComponent -> constructor -> this.dataSource',
          this.dataSource
        );
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
