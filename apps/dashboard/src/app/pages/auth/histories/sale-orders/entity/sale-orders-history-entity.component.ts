import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339, endOfDay, startOfDay } from 'date-fns';
import { BaseListComponent } from '../../../base-list.component';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, StorageService } from '@optimo/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ColumnData, ColumnType, TableComponent } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import {
  EntitySaleStatus,
  entitySaleStatusMap,
} from 'apps/dashboard/src/app/core/enums/entity-sale-status.enum';
import { mapOfEntitySaleOrderPaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { SaleOrderPaymentTypeRetailObj } from '../../../../../core/enums/sale-orders-payment-types-entity.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-sale-orders-history-entity',
  templateUrl: './sale-orders-history-entity.component.html',
  styleUrls: ['./sale-orders-history-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersHistoryEntityComponent extends BaseListComponent
  implements OnInit {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;

  public isHorecaMode = this._storageService.isHorecaMode;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.receiptNumber',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'entityName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.entityName',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'entityIdentifier',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.entityIdentifier',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'transactionId',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.transactionId',
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentMethod',
      filterable: true,
      sortable: true,
      data: mapOfEntitySaleOrderPaymentMethods,
    },
    {
      dataField: 'paymentType',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentType',
      filterable: true,
      sortable: true,
      data: SaleOrderPaymentTypeRetailObj,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'SaleOrdersHistory.TableColumns.status',
      filterable: true,
      sortable: true,
      data: entitySaleStatusMap,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLines',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLinesPrice',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'SaleOrdersHistory.TableColumns.orderDate',
      filterable: false,
      sortable: true,
      data: {
        type: 'dateTime',
      },
    },
  ];

  horecaDisplayedColumns: ColumnData[] = [
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.receiptNumber',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'entityName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.entityName',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'entityIdentifier',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.entityIdentifier',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'transactionId',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.transactionId',
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'paymentType',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentType',
      filterable: true,
      sortable: true,
      data: SaleOrderPaymentTypeRetailObj,
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentMethod',
      filterable: true,
      sortable: true,
      data: mapOfEntitySaleOrderPaymentMethods,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'SaleOrdersHistory.TableColumns.status',
      filterable: true,
      sortable: true,
      data: entitySaleStatusMap,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLines',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalOrderLinesPrice',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLinesPrice',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'taxAmount',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'SaleOrdersHistory.TableColumns.taxAmount',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'SaleOrdersHistory.TableColumns.totalPriceHoreca',
      filterable: true,
      sortable: true,
    },
    // {
    //   dataField: 'totalPrice',
    //   columnType: ColumnType.Number,
    //   caption: 'ჯამური თანხა',
    //   data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
    //   filterable: true,
    //   sortable: true,
    // },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'SaleOrdersHistory.TableColumns.orderDate',
      filterable: false,
      sortable: true,
      data: {
        type: 'dateTime',
      },
    },
  ];

  private dateFrom: string;
  private dateTo: string;

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService,
    private _storageService: StorageService
  ) {
    super(notificator, cdr, route, dialog, router);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo }) => {
        this.dateFrom =
          dateFrom && formatRFC3339(startOfDay(new Date(dateFrom)));
        this.dateTo = dateTo && formatRFC3339(endOfDay(new Date(dateTo)));
        if (this.tableInstance) {
          this.tableInstance.loading = true;
          this.tableInstance.cdr.markForCheck();
        }
        this.requestItems.next();
      });
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('entitysaleorders', { params: this.requestBody });
  }

  // called from parent
  public onExport(): void {
    console.log('B2B Transactions Export');
    this._mixpanelService.track('B2B Transactions Export');
    this.client
      .get('entitysaleorders/excel', {
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

  public onItemsExport(): void {
    console.log('B2B Transactions Export');
    this._mixpanelService.track('B2B Transactions Export');
    this.client
      .get('entitysaleorders/itemsexcel', {
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

  private get requestBody(): HttpParams {
    let params = new HttpParams({
      fromObject: {
        orderDateFrom: formatRFC3339(new Date(this.dateFrom)),
        orderDateTo: formatRFC3339(new Date(this.dateTo)),
        ...this.currentState,
      },
    });
    if (!this.currentState.hasOwnProperty('status')) {
      params = params
        // .append('status', `${EntitySaleStatus.Draft}`)
        .append('status', `${EntitySaleStatus.Sold}`)
        .append('status', `${EntitySaleStatus.Uploaded}`)
        .append('status', `${EntitySaleStatus.Canceled}`);
    }

    return params;
  }
}
