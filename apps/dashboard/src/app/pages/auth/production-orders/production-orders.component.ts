import { ColumnData, ColumnType, NumberColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  BaseListComponent,
  DialogAction,
  DialogActionTypes,
} from '../base-list.component';
import { ClientService } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { map, takeUntil } from 'rxjs/operators';
import {
  ProductionOrderStatus,
  PRODUCTION_ORDER_STATUS_DATA,
} from 'apps/dashboard/src/app/core/enums/production-order-status.enum';
import {
  ApproveDialogComponent,
  DialogData,
} from '@optimo/ui-popups-approve-dialog';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';
import { pickBy } from 'lodash-es';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';

@Component({
  selector: 'app-production-orders',
  templateUrl: './production-orders.component.html',
  styleUrls: ['./production-orders.component.scss'],
})
export class ProductionOrdersComponent extends BaseListComponent
  implements OnInit {
  productionOrderStatusMap = PRODUCTION_ORDER_STATUS_DATA;
  isExcelDropdownActive: boolean;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'orderLines',
      columnType: ColumnType.Text,
      caption: 'GENERAL.RECEIPTS',
      filterable: true,
      sortable: false,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'GENERAL.STATUS',
      filterable: true,
      sortable: true,
      data: PRODUCTION_ORDER_STATUS_DATA,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'ProductionOrders.LIST.TABLE_COLUMNS.TOTAL_COST',
      data: { type: NumberColumnType.Decimal, prefix: '₾', digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'GENERAL.DATE',
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
    private fileDownloadHelper: FileDownloadHelper,
    private _translateService: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Preparations');
  }

  ngOnInit(): void {
    this.subscribeToDialogActions();
    super.ngOnInit();
  }

  protected get httpGetItems(): Observable<any> {
    let params = new HttpParams({
      fromObject: this.currentState as any,
    });
    if (!this.currentState?.hasOwnProperty('status')) {
      params = params
        .append('status', ProductionOrderStatus.Draft.toString())
        .append('status', ProductionOrderStatus.Succeeded.toString());
    }

    return this.client
      .get<any>('stockitemproductionorders', { params })
      .pipe(
        map((res) => {
          res.data = res.data.map((item: any) => ({
            ...item,
            orderLines:
              item.orderLines &&
              item.orderLines.map((l: any) => l.stockItemName).join(', '),
          }));
          return res;
        })
      );
  }

  onEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/production-orders/edit', id]);
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete('stockitemproductionorders', data);
  }

  get isAnySucceeded(): boolean {
    return this.selectedRows.some(
      (row) => row.status === ProductionOrderStatus.Succeeded
    );
  }

  isRowDraft(row: any): boolean {
    return row.status === ProductionOrderStatus.Draft;
  }

  get isSelectedsDraft(): boolean {
    return this.selectedRows.every(
      (row) => row.status === ProductionOrderStatus.Draft
    );
  }

  subscribeToDialogActions(): void {
    this.dialogResult
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((action: DialogAction) => {
        console.log('dev => dialog action is:', action);
        if (action?.actionType === DialogActionTypes.draftFinish)
          this.onDraftFinish({ id: action.id }, true);
        if (action?.actionType === DialogActionTypes.delete)
          this.onDelete({ id: action.id }, true);
      });
  }

  onDraftFinish(row?: any, backToQueryParam: boolean = false): void {
    console.log(
      'dev => shippings => onDraftFinish row:',
      row,
      'back to query:',
      backToQueryParam
    );
    const id = row?.id || (this?.selectedRows[0] && this?.selectedRows[0]?.id);
    const dialogData: DialogData = {
      approveBtnLabel: 'ProductionOrders.prepare',
      denyBtnLabel: backToQueryParam ? 'GENERAL.BACKBTN' : 'GENERAL.CANCEL',
      title: 'ProductionOrders.prepareApprove',
    };
    // this.router.navigate(['/entity-sales/edit', id]);
    this.approveAction(dialogData).subscribe((res) => {
      if (res === true) {
        console.log('dev => should send finish requeste because res is:', res);
        const data = {
          id,
        };
        this.client
          .put('stockitemproductionorders/finish', data)
          .subscribe((response) => {
            console.log('dev => stock transfer finish response:', response);
            this.notificator.saySuccess(
              this._translateService.instant('ProductionOrders.prepareSuccess')
            );
            this.requestItems.next();
          });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('productionOrderId', id);
        }
      }
    });
  }

  onDelete(row?: any, backToQueryParam: boolean = false): void {
    const id =
      (row && row.id) || (this?.selectedRows[0] && this?.selectedRows[0]?.id);
    const dialogData: DialogData = {
      approveBtnLabel: 'GENERAL.DELETE',
      denyBtnLabel: backToQueryParam ? 'GENERAL.BACKBTN' : 'GENERAL.CANCEL',
      title: 'GENERAL.APPROVE_DELETE',
    };
    // this.router.navigate(['/entity-sales/edit', id]);
    this.approveAction(dialogData).subscribe((res) => {
      if (res === true) {
        console.log('dev => should send delete requeste because res is:', res);
        const data = row?.id
          ? { ids: [row.id] }
          : { ids: this.selectedRows.map((r) => r.id) };
        this.client.delete('stockitemproductionorders', data).subscribe(() => {
          this.notificator.saySuccess(
            this._translateService.instant('ProductionOrders.deleteSuccess')
          );
          this.requestItems.next();
        });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('productionOrderId', id);
        }
      }
    });
  }

  approveAction(dialogData: DialogData): Observable<boolean> {
    return this.dialog
      .open(ApproveDialogComponent, {
        data: dialogData,
        width: '480px',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$));
  }

  // onExport(): void {
  //   this.client
  //     .get<any>('stockitemproductionorders/excel', {
  //       params: this.requestBody,
  //       responseType: 'blob',
  //     })
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((response: HttpResponse<Blob>) => {
  //       this.fileDownloadHelper.downloadFromResponse(
  //         response,
  //         'application/ms-excel',
  //         'Ingredients.xlsx'
  //       );
  //     });
  // }

  onExportProductionOrders(): void {
    this.handleExportPopup('stockitemproductionorders/excel');
  }

  onExportReceipts(): void {
    this.handleExportPopup('stockitemproductionorders/stockitemreceipt-excel');
  }

  private handleExportPopup(
    exportParam:
      | 'stockitemproductionorders/excel'
      | 'stockitemproductionorders/stockitemreceipt-excel'
  ): void {
    const dialogRef = this.dialog.open(LoadingPopupComponent, {
      width: '548px',
      data: {
        message:
          exportParam === 'stockitemproductionorders/excel'
            ? 'ProductionOrders.exportProductionOrdersLoadingPopupText'
            : 'ProductionOrders.exportReceiptsLoadingPopupText',
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

  private onExportRequest(
    exportParam:
      | 'stockitemproductionorders/excel'
      | 'stockitemproductionorders/stockitemreceipt-excel'
  ): Observable<any> {
    let params = this.requestBody;
    if (!this.currentState.hasOwnProperty('status')) {
      params = params
        .append('status', ProductionOrderStatus.Draft.toString())
        .append('status', ProductionOrderStatus.Succeeded.toString());
    }
    const endpoint = exportParam;
    return this.client
      .get(endpoint, {
        params,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$));
  }

  private get requestBody(): HttpParams {
    const { ...state } = this.currentState;
    const data = pickBy(
      {
        ...state,
      },
      (val) => val || (val as any) === 0
    );

    return new HttpParams({
      fromObject: data as any,
    });
  }
}
