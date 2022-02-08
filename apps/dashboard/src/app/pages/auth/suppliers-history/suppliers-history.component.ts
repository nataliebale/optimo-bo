import { HistoryItemStatus } from './../../../core/enums/history-item-status.enum';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupComponent } from 'apps/dashboard/src/app/popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType, NumberColumnType } from '@optimo/ui-table';
import { HistoryPaymentMethods } from './../../../core/enums/history-payment-methods.enum';
import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { Observable } from 'rxjs';
import { SupplierStatuses } from '../../../core/enums/supplier-statuses.enum';
import { BaseListComponent } from '../base-list.component';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { mapOfHistoryPaymentMethods } from '../../../core/enums/history-payment-methods.enum';
import { mapOfHistoryItemStatus } from '../../../core/enums/history-item-status.enum';
import { MixpanelService } from '@optimo/mixpanel';
import { SuppliersHistoryTransactionPopupComponent } from './transaction-popup/suppliers-history-transaction-popup.component';
import { mapOfHistoryItemTypes } from '../../../core/enums/history-item-types.enum';

@Component({
  selector: 'app-suppliers-history',
  templateUrl: './suppliers-history.component.html',
  styleUrls: ['./suppliers-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersHistoryComponent extends BaseListComponent {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.TITLE',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.TYPE',
      filterable: true,
      sortable: true,
      data: mapOfHistoryItemTypes,
    },
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.SUPPLIER',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.Dropdown,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.PAYMENT_METHOD',
      filterable: true,
      sortable: true,
      data: mapOfHistoryPaymentMethods,
    },
    {
      dataField: 'transferAmount',
      columnType: ColumnType.Number,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.TRANSFER_AMOUNT',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'balance',
      columnType: ColumnType.Number,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.BALANCE',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
        statusFieldName: 'status',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.STATUS',
      filterable: true,
      sortable: true,
      data: mapOfHistoryItemStatus,
    },
    {
      dataField: 'date',
      columnType: ColumnType.Date,
      caption: 'SUPPLIERS_HISTORY.LIST.TABLE_COLUMNS.DATE',
      filterable: true,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private translate: TranslateService,
    private fileDownloadHelper: FileDownloadHelper,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Liability Management');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get<any>('suppliers/balances', {
      params: new HttpParams({
        fromObject: this.currentState as any,
      }),
    });
  }

  private get requestBody(): HttpParams {
    return new HttpParams({
      fromObject: this.currentState as any,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Liability Management Export');
    const request = this.client.get<any>(`suppliers/balances/excel`, {
      params: this.requestBody,
      responseType: 'blob',
    });
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: this.translate.instant(
            'LOADING_POPUP_LABELS.DOWNLOADING_RECORDS'
          ),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        if (response) {
          this.fileDownloadHelper.downloadFromResponse(
            response,
            'application/ms-excel'
          );
        }
      });
  }

  onOpenTransactionPopup(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.dialog
      .open(SuppliersHistoryTransactionPopupComponent, {
        width: '548px',
        data: id,
        panelClass: 'overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  getSuppliers = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: `${SupplierStatuses.Enabled}`,
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get<any>('suppliers', { params });
  };

  openCancelDialog(row?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: this.deletePopupMessage || `ნამდვილად გსურს გაუქმება?`,
          approveBtnLabel: 'კი',
          denyBtnLabel: 'არა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.deleteAndRefreshItems(row);
        }
      });
  }

  protected deleteAndRefreshItems(row?: any): void {
    this.requestDeleteItems(row)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess('ჩანაწერი წარმატებით გაუქმდა');
        this.requestItems.next();
      });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : {
            ids: this.idsOfSelectedItems,
          };
    return this.client.delete('suppliers/balances', data);
  }

  openEditDialog(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/suppliers/edit/' + id]);
  }

  getSupplierById = (id: number): Observable<any> => {
    return this.client.get<any>(`suppliers/${id}`);
  };

  isRowPayment = (row: any): boolean => {
    return (
      row.paymentMethod === HistoryPaymentMethods.Card ||
      row.paymentMethod === HistoryPaymentMethods.Cash
    );
  };

  isRowDisabled = (row: any): boolean => {
    return (
      (row.paymentMethod === HistoryPaymentMethods.Card ||
        row.paymentMethod === HistoryPaymentMethods.Cash) &&
      row.status === HistoryItemStatus.Enabled
    );
  };

  get isRowsCancelable(): boolean {
    let isCancelable = true;
    this.selectedRows.forEach((element) => {
      if (element.supplierId !== this.selectedRows[0].supplierId)
        isCancelable = false;
    });
    return this.selectedRows && this.selectedRows.length >= 1 && isCancelable;
  }

  isRowSelectable = (row: any): boolean => {
    return this.isLessThanAMonth(row) && this.isRowDisabled(row);
  };

  isLessThanAMonth = (row: any): boolean => {
    {
      const currentDate = new Date();
      const dateSent = new Date(row.date);
      return (
        Math.floor(
          (Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          ) -
            Date.UTC(
              dateSent.getFullYear(),
              dateSent.getMonth(),
              dateSent.getDate()
            )) /
            (1000 * 60 * 60 * 24)
        ) <= 31
      );
    }
  };
}
