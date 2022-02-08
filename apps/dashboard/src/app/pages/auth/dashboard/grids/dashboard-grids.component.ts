import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ColumnData,
  ColumnType,
  getUMOAcronym,
  TableComponent,
} from '@optimo/ui-table';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ClientService, Service, StorageService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { OrderStatuses } from 'apps/dashboard/src/app/core/enums/order-status.enum';
import { formatRFC3339, format } from 'date-fns';
import { NumberColumnType } from '@optimo/ui-table';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
import { TranslateService } from '@ngx-translate/core';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
	selector: 'app-dashboard-grids',
	templateUrl: './dashboard-grids.component.html',
	styleUrls: ['./dashboard-grids.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGridsComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  @ViewChild('incomeTableInstance') incomeTableInstance: TableComponent;
  @ViewChild('revenueTableInstance') revenueTableInstance: TableComponent;
  getUMOAcronym = getUMOAcronym;
  @Input()
  totalCount = 5;

  private _dateRange: Date[];

  @Input()
  set dateRange(value: Date[]) {
    this._dateRange = value;
    // this.clearData();
    if (value) {
      this.getDateDependentGridsData();
    }
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  format = format;
  activeTab: 'income' | 'revenue' = 'revenue';

  incomeDataSource: any[];
  // locationId = this.storage.get('locationId');
  locationId = this.location.id;
  incomeColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.8,
    },
    {
      dataField: 'quantitySold',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      caption: 'GENERAL.AMOUNT_OF_MONEY',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
      className: 'table-text-muted',
    },
  ];

  revenueDataSource: any[];
  revenueColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.8,
    },
    {
      dataField: 'quantitySold',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalRevenue',
      columnType: ColumnType.Number,
      caption: 'GENERAL.AMOUNT_OF_MONEY',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
      className: 'table-text-muted',
    },
  ];

  stockitemsDataSource: any[];
  stockitemsColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Float },
      caption: 'GENERAL.QUANTITY',
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
  ];

  purchaseOrdersDataSource: any[];
  purchaseOrdersColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.DISTRIBUTOR',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'expectedTotalCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      caption: 'MAIN.CARDS.UPCOMING_PURCHASE.TABLE.TOTAL_AMOUNT',
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'expectedReceiveDate',
      columnType: ColumnType.Date,
      caption: 'GENERAL.DATE',
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private location: LocationService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.client
      .get<any>('warehouse/dashboard/stockitemlowholdings', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            pageSize: this.totalCount.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
        this.stockitemsDataSource = data;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('purchaseorders', {
        params: new HttpParams({
          fromObject: {
            sortField: 'expectedReceiveDate',
            sortOrder: 'ASC',
            pageIndex: '0',
            pageSize: this.totalCount.toString(),
            status: [
              OrderStatuses.Ordered.toString(),
              OrderStatuses.Delayed.toString(),
            ],
          },
        }),
      })
      .pipe(map(({ data }) => data))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
        this.purchaseOrdersDataSource = data;
        this.cdr.markForCheck();
      });

    this.translate
      .get([
        'MAIN.CARDS.POPULAR_PRODUCTS.TABLE.NAME',
        'MAIN.CARDS.POPULAR_PRODUCTS.TABLE.QUANTITY',
        'MAIN.CARDS.POPULAR_PRODUCTS.TABLE.AMOUNT_OF_MONEY',
      ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => console.log('translation is', res));
  }

  private getDateDependentGridsData(): void {
    const dateFrom = formatRFC3339(this.dateRange[0]);
    const dateTo = formatRFC3339(this.dateRange[1]);
    if (this.revenueTableInstance) {
      this.revenueTableInstance.loading = true;
      this.revenueTableInstance.cdr.markForCheck();
    }
    if (this.incomeTableInstance) {
      this.incomeTableInstance.loading = true;
      this.incomeTableInstance.cdr.markForCheck();
    }
    this.client
      .get<any>('warehouse/dashboard/popularstockitemsbyrevenue', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            pageIndex: '0',
            pageSize: this.totalCount.toString(),
            dateFrom,
            dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        this.revenueDataSource = data;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('warehouse/dashboard/popularstockitemsbyincome', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            pageSize: this.totalCount.toString(),
            pageIndex: '0',
            dateFrom,
            dateTo,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        this.incomeDataSource = data;
        this.cdr.markForCheck();
      });
  }

  toggleTab(tab: 'income' | 'revenue'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  private clearData(): void {
    this.incomeDataSource = null;
    this.revenueDataSource = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
