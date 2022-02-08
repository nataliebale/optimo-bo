import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseListComponent } from '../../../base-list.component';
import { ColumnData, ColumnType, TableComponent } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { ClientService, StorageService } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { formatRFC3339, startOfDay, endOfDay } from 'date-fns';
import { takeUntil, map } from 'rxjs/operators';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { SaleOrderPaymentTypeRetailObj } from '../../../../../core/enums/sale-orders-payment-types-retail.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-sale-orders-history-retail',
  templateUrl: './sale-orders-history-retail.component.html',
  styleUrls: ['./sale-orders-history-retail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersHistoryRetailComponent extends BaseListComponent
  implements OnInit {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  public isHorecaMode = this._storageService.isHorecaMode;
  horecaDisplayedColumns: ColumnData[] = [
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.receiptNumber',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
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
      dataField: 'status',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'GENERAL.TYPE',
      filterable: true,
      sortable: true,
      data: {
        5: 'აქტიური',
        95: 'დაბრუნებული',
      },
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentMethod',
      filterable: true,
      sortable: true,
      data: {
        1: 'ნაღდი',
        2: 'უნაღდო',
        3: 'მანუალური',
      },
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
      dataField: 'operatorName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.operatorName',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'imeIs',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.imeIs',
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLines',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.FullNumber,
      },
    },
    {
      dataField: 'totalOrderLinesPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalPrice',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
    },
    {
      dataField: 'taxAmount',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.taxAmount',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalPriceHoreca',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
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
  displayedColumns: ColumnData[] = [
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.receiptNumber',
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
      dataField: 'status',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'GENERAL.TYPE',
      filterable: true,
      sortable: true,
      data: {
        5: 'აქტიური',
        95: 'დაბრუნებული',
      },
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'SaleOrdersHistory.TableColumns.paymentMethod',
      filterable: true,
      sortable: true,
      data: {
        1: 'ნაღდი',
        2: 'უნაღდო',
        3: 'მანუალური',
      },
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
      dataField: 'operatorName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.operatorName',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'imeIs',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.TableColumns.imeIs',
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalOrderLines',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.FullNumber,
      },
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.TableColumns.totalPrice',
      filterable: true,
      sortable: true,
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
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
    return this.client
      .get<any>('saleorders', { params: this.requestBody })
      .pipe(
        map((res) => {
          res.data = res.data.map((item) => {
            let imeisText = item.iemis ? item.iemis.join(', ') : '';
            if (imeisText.length > 50) {
              imeisText = `${imeisText.slice(0, 50)}...`;
            }
            item.imeisText = imeisText;
            return item;
          });
          return res;
        })
      );
  }

  // called from parent
  public onExport(): void {
    console.log('B2C Transactions Export');
    this._mixpanelService.track('B2C Transactions Export');
    this.client
      .get('saleorders/excel', {
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
    console.log('B2C Transactions Export');
    this._mixpanelService.track('B2C Transactions Export');
    this.client
      .get('saleorders/itemsexcel', {
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
    return new HttpParams({
      fromObject: {
        pageIndex: '0',
        pageSize: '0',
        sortField: 'orderDate',
        sortOrder: 'DESC',
        orderDateFrom: formatRFC3339(new Date(this.dateFrom)),
        orderDateTo: formatRFC3339(new Date(this.dateTo)),
        status: ['5', '95'],
        ...this.currentState,
      },
    });
  }

  getImeisText(imeis: string[]): string {
    return imeis && imeis.join(', \n');
  }

  getShortImeisText(imeis: string[]): string {
    let text = imeis && imeis[0];
    if (imeis && imeis.length > 1) {
      text += ', ';
    }
    return text;
  }
}
