import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
  OrderStatuses,
  orderStatusData,
} from 'apps/dashboard/src/app/core/enums/order-status.enum';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { EditModes } from '../../../core/enums/edit-modes.enum';
import { ColumnType, ColumnData, NumberColumnType } from '@optimo/ui-table';
import { Observable } from 'rxjs';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { BaseListComponent } from '../base-list.component';
import { takeUntil } from 'rxjs/operators';
import decode from 'jwt-decode';
import { StorageService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';
import { textIsTruncated } from '@optimo/util/text-is-truncated';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent extends BaseListComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  statusData = orderStatusData;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.TITLE',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.COMPANY',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.STATUS',
      filterable: true,
      sortable: true,
      data: this.statusData,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.QUANTITY',
      data: { type: NumberColumnType.Decimal },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'expectedTotalCost',
      columnType: ColumnType.Number,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.TOTAL_COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'expectedReceiveDate',
      columnType: ColumnType.Date,
      caption: 'ORDERS.LIST.TABLE_COLUMNS.DATE',
      filterable: true,
      sortable: true,
    },
  ];
  orderStatuses = OrderStatuses;

  isAdmin: boolean;

  isExcelDropdownActive: boolean;

  constructor(
    private client: ClientService,
    private storage: StorageService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService,
    private fileDownloadHelper: FileDownloadHelper
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Purchases');
  }

  ngOnInit(): void {
    super.ngOnInit();

    const accessToken = this.storage.getAccessToken();
    const tokenPayload = decode(accessToken);
    this.isAdmin = tokenPayload.isAdmin;
  }

  protected get httpGetItems(): Observable<any> {
    let params = new HttpParams({
      fromObject: this.currentState as any,
    });
    if (!this.currentState.hasOwnProperty('status')) {
      params = params
        .append('status', `${OrderStatuses.Draft}`)
        .append('status', `${OrderStatuses.Ordered}`)
        .append('status', `${OrderStatuses.Delayed}`)
        .append('status', `${OrderStatuses.Canceled}`)
        .append('status', `${OrderStatuses.Received}`);
    }

    return this.client.get('purchaseorders', { params });
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/orders/edit', id, EditModes.Edit]);
  }

  goToReceive(): void {
    this.router.navigate([
      '/orders/receive',
      this.selectedRows[0].id,
      EditModes.Receive,
    ]);
  }

  onCancel(): void {
    this.client
      .put(`purchaseorders/cancel`, {
        id: this.selectedRows[0].id,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete('purchaseorders', data);
  }

  onExportOrders(): void {
    this._mixpanelService.track('Purchases Export (Purchases)');
    this.handleExportPopup('orders');
  }

  onExportProducts(): void {
    this._mixpanelService.track('Purchases Export (Products)');
    this.handleExportPopup('products');
  }

  private handleExportPopup(exportParam: 'orders' | 'products'): void {
    const dialogRef = this.dialog.open(LoadingPopupComponent, {
      width: '548px',
      data: {
        message: 'ORDERS.EXPORT_LOADING_POPUP_TEXT',
      },
    });

    dialogRef
      .afterOpened()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((_) => {
        console.log('dev => dialog opened');
        this.onExportRequest(exportParam)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((response: HttpResponse<Blob>) => {
            this.fileDownloadHelper.downloadFromResponse(
              response,
              'application/ms-excel'
            );
            dialogRef.close();
          });
      });
  }

  private onExportRequest(exportParam: 'orders' | 'products'): Observable<any> {
    let params = new HttpParams({
      fromObject: this.currentState as any,
    });
    if (!this.currentState.hasOwnProperty('status')) {
      params = params
        .append('status', `${OrderStatuses.Draft}`)
        .append('status', `${OrderStatuses.Ordered}`)
        .append('status', `${OrderStatuses.Delayed}`)
        .append('status', `${OrderStatuses.Canceled}`)
        .append('status', `${OrderStatuses.Received}`);
    }

    const endpoint =
      exportParam === 'orders'
        ? 'purchaseorders/excel'
        : 'purchaseorders/product-excel';

    return this.client
      .get(endpoint, {
        params,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$));
  }

  duplicateSelected(): void {
    const id = this.selectedRows[0].id;

    this.router.navigate(['orders/duplicate', id, EditModes.Duplicate]);
  }

  get anyIsReceived(): boolean {
    return this.selectedRows.some(
      (row) => row.status === OrderStatuses.Received
    );
  }

  get isAllDraft(): boolean {
    return this.selectedRows.every((row) => row.status === OrderStatuses.Draft);
  }

  rowNotReceived = (row: any): boolean => {
    return !this.isRowReceived(row);
  };

  isRowReceived = (row: any): boolean => {
    return row.status === OrderStatuses.Received;
  };

  isRowEditable(row): boolean {
    return row.status === OrderStatuses.Draft;
  }

  isRowDeletable(row): boolean {
    return row.status !== OrderStatuses.Received;
  }

  isRowDraft = (row): boolean => {
    return row?.status === OrderStatuses.Draft;
  };

  isRowDelayed = (row): boolean => {
    return row?.status === OrderStatuses.Delayed;
  };

  canDuplicate(row): boolean {
    return !row.isExcel;
  }
}
