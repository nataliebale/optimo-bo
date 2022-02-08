import {
  Component,
  OnDestroy,
  Input,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { Observable, of, Subject } from 'rxjs';
import {
  ChartComponent,
  ChartConfig,
  ChartTypes,
  ChartAxisTypes,
  ChartSeriesTypes,
} from '@optimo/ui-chart';
import { takeUntil } from 'rxjs/operators';
import { endOfToday, subDays, formatRFC3339 } from 'date-fns';

@Component({
  selector: 'app-supplier-report-chart',
  templateUrl: './supplier-report-chart.component.html',
  styleUrls: ['./supplier-report-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierReportChartComponent implements OnDestroy {
  @ViewChild(ChartComponent, { static: true })
  chart: any;

  private _supplierId: number;

  @Input()
  set supplierId(value: number) {
    this._supplierId = value;
    this.getChartData();
    this.stockItemId = null;
    this.chart.reloadDynamicSelector();
  }

  get supplierId(): number {
    return this._supplierId;
  }

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
        color: '#0077ff',
        keyField: 'saleDate',
        valueField: 'totalExpense',
        text: 'თვითღირებულება',
      },
      {
        type: ChartSeriesTypes.Line,
        color: '#2fcd8a',
        keyField: 'saleDate',
        valueField: 'totalRevenue',
        text: 'შემოსავალი',
      },
    ],
  };

  private stockItemId: number;
  private selectedPeriod: number;
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  getStockitems = (state: any): Observable<any> => {
    if (!this.supplierId) {
      return of({ totalCount: 0, data: [] });
    }

    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [StockItemStatuses.Enabled.toString(), StockItemStatuses.Disabled.toString()],
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get(`suppliers/${this.supplierId}/stockitems`, {
      params,
    });
  };

  private async getChartData() {
    this.unsubscribe$.next();
    if (!this.selectedPeriod || !this.supplierId) {
      return;
    }

    let params = new HttpParams({
      fromObject: {
        supplierId: this.supplierId.toString(),
        dateFrom: formatRFC3339(subDays(endOfToday(), this.selectedPeriod)),
      },
    });

    if (this.stockItemId) {
      params = params.append('stockItemIds', this.stockItemId.toString());
    }

    this.client
      .get('reports/saleorders/stockitems/grouped', { params })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.dataSource = result;
        this.cdr.markForCheck();
      });
  }

  onStateChange({ period, filter }): void {
    this.selectedPeriod = period;
    this.stockItemId = filter;
    this.getChartData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
