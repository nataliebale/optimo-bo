import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  ColumnType,
  ColumnData,
  getUMOAcronym,
  TableComponent,
} from '@optimo/ui-table';
import { Observable } from 'rxjs';
import { ClientService } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { StockItemTransactionType } from '../../../../core/enums/stockitem-transaction-type.enum';
import { NumberColumnType } from '@optimo/ui-table';
import { BaseListComponent } from '../../base-list.component';
import { takeUntil } from 'rxjs/operators';
import {
  endOfToday,
  subDays,
  startOfToday,
  formatRFC3339,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { FileDownloadHelper } from '../../../../core/helpers/file-download/file-download.helper.ts';
import { pickBy } from 'lodash-es';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-supplies-history',
  templateUrl: './supplies-history.component.html',
  styleUrls: ['./supplies-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliesHistoryComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];
  dateRange: Date[] = this.defaultDate;
  getUMOAcronym = getUMOAcronym;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'suppliers',
      columnType: ColumnType.Text,
      caption: 'SuppliesHistory.TableColumns.suppliers',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'SuppliesHistory.TableColumns.categoryName',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'type',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SuppliesHistory.TableColumns.type',
      data: {
        [StockItemTransactionType.Initial]: 'იმპორტი',
        [StockItemTransactionType.Purchase]: 'შესყიდვა',
        [StockItemTransactionType.PurchaseReturn]: 'უკან დაბრუნება',
        [StockItemTransactionType.StocktakePlus]: 'ნამატი',
        [StockItemTransactionType.StocktakeMinus]: 'ზარალი',
        [StockItemTransactionType.Damage]: 'დაზიანება',
        [StockItemTransactionType.Loss]: 'დაკარგვა',
        [StockItemTransactionType.Steal]: 'მოპარვა',
        [StockItemTransactionType.StocktakeMinus]: 'ზარალი',
        [StockItemTransactionType.Purchase]: 'შესყიდვა',
        [StockItemTransactionType.PurchaseReturn]: 'უკან დაბრუნება',
        [StockItemTransactionType.StockTransferMinus]: 'გადაზიდვა (-)',
        [StockItemTransactionType.StockTransferPlus]: 'გადაზიდვა (+)',
        [StockItemTransactionType.DelistedSaleReturn]: 'ჩამოწერა (უკან დაბრუნება)',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantityBefore',
      columnType: ColumnType.Number,
      caption: 'SuppliesHistory.TableColumns.quantityBefore',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'transactionQuantity',
      columnType: ColumnType.Number,
      caption: 'SuppliesHistory.TableColumns.transactionQuantity',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantityAfter',
      columnType: ColumnType.Number,
      caption: 'SuppliesHistory.TableColumns.quantityAfter',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'transactionDate',
      columnType: ColumnType.Date,
      caption: 'SuppliesHistory.TableColumns.transactionDate',
      filterable: false,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this.getDateRangeFromUrl();
    this._mixpanelService.track('Supplies');
  }

  getDateRangeFromUrl(): void {
    if (!this.route.snapshot.queryParams['dateFrom']) {
      const params = {
        dateFrom: format(this.dateRange[0], 'yyyy-MM-dd'),
        dateTo: format(this.dateRange[1], 'yyyy-MM-dd'),
      };
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    }
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo }) => {
        if (dateFrom && dateTo) {
          this.dateRange = [
            startOfDay(new Date(dateFrom)),
            endOfDay(new Date(dateTo)),
          ];
        } else {
          this.dateRange = this.defaultDate;
        }
        this.cdr.markForCheck();
      });
  }

  onDateChanged(dateRange: Date[]): void {
    if (!dateRange) {
      dateRange = this.defaultDate;
    }
    const params = {
      dateFrom: formatRFC3339(dateRange[0]),
      dateTo: formatRFC3339(dateRange[1]),
    };
    const oldDates = {
      dateFrom: formatRFC3339(this.dateRange[0]),
      dateTo: formatRFC3339(this.dateRange[1]),
    };
    const dateChanged = JSON.stringify(oldDates) !== JSON.stringify(params);
    if (!dateChanged) {
      return;
    }
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    if (this.tableInstance) {
      this.tableInstance.loading = true;
      this.tableInstance.cdr.markForCheck();
    }
  }

  protected get httpGetItems(): Observable<any> {
    const { type, ...state } = this.currentState;
    if (type) {
      (state as any).types = [type];
    }

    return this.client.get('stockitems/transactions', {
      params: this.requestBody,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Supplies Export');
    this.client
      .get('stockitems/transactions/excel', {
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
  }

  getSuppliersName(suppliers: any[]): string {
    return suppliers && suppliers.map((s) => s.name)?.join(', \n');
  }

  getShortSuppliersName(suppliers: any[]): string {
    let name = suppliers && suppliers[0]?.name;
    if (suppliers?.length > 1) {
      name += ', ';
    }
    return name;
  }

  getSign(row: any): string {
    const difference = row.quantityAfter - row.quantityBefore;
    if (!difference) {
      return '';
    }
    return difference > 0 ? '+' : '-';
  }

  private get requestBody(): HttpParams {
    const { type, stockItemName, ...state } = this.currentState;
    if (type) {
      (state as any).types = type;
    }

    const params = new HttpParams({
      fromObject: pickBy(
        {
          transactionDateFrom: formatRFC3339(this.dateRange[0]),
          transactionDateTo: formatRFC3339(this.dateRange[1]),
          types: [
            StockItemTransactionType.Initial.toString(),
            StockItemTransactionType.StocktakePlus.toString(),
            StockItemTransactionType.StocktakeMinus.toString(),
            StockItemTransactionType.Damage.toString(),
            StockItemTransactionType.Loss.toString(),
            StockItemTransactionType.Steal.toString(),
            StockItemTransactionType.Purchase.toString(),
            StockItemTransactionType.PurchaseReturn.toString(),
            StockItemTransactionType.StockTransferPlus.toString(),
            StockItemTransactionType.StockTransferMinus.toString(),
            StockItemTransactionType.DelistedSaleReturn.toString(),
          ],
          stockItemBarcodeOrName: stockItemName as string,
          ...state,
        },
        (val) => val || (val as any) === 0
      ),
    });

    return params;
  }
}
