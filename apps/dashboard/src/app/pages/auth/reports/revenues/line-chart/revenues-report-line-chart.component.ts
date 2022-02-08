import {
  Component,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { endOfToday, subDays, formatRFC3339 } from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import {
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';

@Component({
  selector: 'app-revenues-report-line-chart',
  templateUrl: './revenues-report-line-chart.component.html',
  styleUrls: ['./revenues-report-line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenuesReportLineChartComponent implements OnDestroy {
  @Input()
  dateAxisTitle: string;

  @Input()
  valueAxisTitle: string;

  @Input()
  dateDataField: string;

  @Input()
  valueDataField: string;

  get chartConfig(): ChartConfig {
    return {
      type: ChartTypes.XY,
      cursor: true,
      xAxisConfig: {
        type: ChartAxisTypes.DateAxis,
        endToEnd: true,
        disableGrid: true,
        title: this.dateAxisTitle,
      },
      yAxisConfig: {
        type: ChartAxisTypes.ValueAxis,
        title: this.valueAxisTitle,
      },
      groupBy: 'stockItemId',
      series: [
        {
          type: ChartSeriesTypes.Line,
          keyField: this.dateDataField,
          valueField: this.valueDataField,
        },
      ],
      colors: this.colors,
    };
  }

  private selectedPeriod: number;
  private unsubscribe$ = new Subject<void>();
  selectedStockItems: any[];
  allStockItems: boolean;
  dataSource: any;
  legendItems: any;

  colors = [
    '#2fcd8a',
    '#0077ff',
    '#ff6383',
    '#ffcd56',
    '#4bc0c0',
    '#36a2eb',
    '#ff9f40',
  ];

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {
    this.getChartData();
  }

  private getChartData(): void {
    this.unsubscribe$.next();
    if (
      !this.selectedPeriod ||
      (!this.allStockItems &&
        (!this.selectedStockItems || this.selectedStockItems.length === 0))
    ) {
      return;
    }

    this.client
      .get('reports/saleorders/stockitems/grouped', {
        params: new HttpParams({
          fromObject: this.allStockItems
            ? {
                dateFrom: formatRFC3339(
                  subDays(endOfToday(), this.selectedPeriod)
                ),
              }
            : {
                stockItemIds: this.selectedStockItems.map((i) => `${i}`),
                dateFrom: formatRFC3339(
                  subDays(endOfToday(), this.selectedPeriod)
                ),
              },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.dataSource = result;
        this.cdr.markForCheck();
      });
  }

  getStockitems = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: StockItemStatuses.Enabled.toString(),
        withTypeFlag: StockItemType.Product.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    // fix hidden items
    params = params.append('status', StockItemStatuses.Disabled.toString());

    return this.client.get('stockitems', { params });
  };

  onStateChange({ period, isSelectedAll, selectedItems }): void {
    this.selectedPeriod = period;
    this.allStockItems = isSelectedAll;
    this.selectedStockItems = selectedItems;
    this.getChartData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
