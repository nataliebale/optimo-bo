import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, StorageService } from '@optimo/core';
import { ColumnType, ColumnData, NumberColumnType } from '@optimo/ui-table';
import { Observable, EMPTY } from 'rxjs';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import {
  BaseListComponent,
  DialogAction,
  DialogActionTypes,
} from '../base-list.component';
// tslint:disable-next-line:nx-enforce-module-boundaries
import {
  entitySaleStatusMap,
  EntitySaleStatus,
} from 'apps/dashboard/src/app/core/enums/entity-sale-status.enum';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { mapOfEntitySaleOrderPaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import {
  ApproveDialogComponent,
  DialogData,
} from '@optimo/ui-popups-approve-dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-entity-sales',
  templateUrl: './entity-sales.component.html',
  styleUrls: ['./entity-sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitySalesComponent extends BaseListComponent implements OnInit {
  entitySaleStatusMap = entitySaleStatusMap;
  public textIsTruncated = textIsTruncated;
  public isHorecaMode = this._storageService.isHorecaMode;
  isGlovoUser = this._storageService.isGlovoUser;
  glovoColumns = this.isGlovoUser ? [
    {
      dataField: 'glovoFee',
      columnType: ColumnType.Number,
      caption: 'გლოვოს %',
      data: { type: NumberColumnType.Percent },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'optimoFee',
      columnType: ColumnType.Number,
      caption: 'ოპტიმოს %',
      data: { type: NumberColumnType.Percent },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'income',
      columnType: ColumnType.Number,
      caption: 'მოგება',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
  ] : []

  displayedColumns: ColumnData[] = [
    {
      dataField: 'entityNameOrIdentifier',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.Dropdown,
      caption: 'გადახდის ტიპი',
      filterable: true,
      sortable: true,
      data: mapOfEntitySaleOrderPaymentMethods,
      widthCoefficient: 1,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      data: entitySaleStatusMap,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'რაოდენობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'ჯამური თანხა',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    ...this.glovoColumns,
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'შეკვეთის ნომერი',
      filterable: true,
      sortable: true,
      hidden: true,
      widthCoefficient: 1,
    },
  ];

  horecaDisplayColumns: ColumnData[] = [
    {
      dataField: 'entityNameOrIdentifier',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'paymentMethod',
      columnType: ColumnType.Dropdown,
      caption: 'გადახდის ტიპი',
      filterable: true,
      sortable: true,
      data: mapOfEntitySaleOrderPaymentMethods,
      widthCoefficient: 1,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      data: entitySaleStatusMap,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.FullNumber },
      caption: 'რაოდენობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalOrderLinesPrice',
      columnType: ColumnType.Number,
      caption: 'ღირებულება',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'taxAmount',
      columnType: ColumnType.Number,
      caption: 'საკომისიო',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'ჯამური თანხა',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'receiptNumber',
      columnType: ColumnType.Text,
      caption: 'შეკვეთის ნომერი',
      filterable: true,
      sortable: true,
      hidden: true,
      widthCoefficient: 1,
    },
  ];

  requestIsSent: boolean;
  deletePopupMessage = 'ნამდვილად გსურს წაშლა?';

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _storageService: StorageService,
    private _mixpanelService: MixpanelService,
    private fileDownloadHelper: FileDownloadHelper
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('B2B Sales');
  }

  ngOnInit(): void {
    this.subscribeToDialogActions();
    super.ngOnInit();
  }

  protected get httpGetItems(): Observable<any> {
    /**
     * Because in name field we merged name and identifier, that field name is entityNameOrIdentifier.
     * but in back-end, when sorting, sortField should become "name" not "entityNameOrIdentifier"
     */
    if (
      this.currentState.hasOwnProperty('sortField') &&
      this.currentState['sortField'] === 'entityNameOrIdentifier'
    ) {
      this.currentState['sortField'] = 'entityName';
    }

    let params = new HttpParams({
      fromObject: this.currentState as any,
    });
    if (!this.currentState?.hasOwnProperty('status')) {
      params = params
        .append('status', `${EntitySaleStatus.Draft}`)
        .append('status', `${EntitySaleStatus.Uploaded}`)
        .append('status', `${EntitySaleStatus.Sold}`)
        .append('status', `${EntitySaleStatus.Canceled}`);
    }

    return this.client.get('entitysaleorders', { params });
  }

  onEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/entity-sales/edit', id]);
  }

  private get requestBody(): HttpParams {
    return new HttpParams({
      fromObject: this.currentState as any,
    });
  }

  onExport(): void {
    const request = this.client.get<any>(`entitysaleorders/excel-with-fees`, {
      params: this.requestBody,
      responseType: 'blob',
    });
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს ჩანაწერების ჩამოტვირთვა',
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

  onSellDraft(row?: any, backToQueryParam: boolean = false): void {
    const id =
      (row && row.id) || (this?.selectedRows[0] && this?.selectedRows[0]?.id);
    const dialogData: DialogData = {
      approveBtnLabel: 'გაყიდვა',
      denyBtnLabel: backToQueryParam ? 'დაბრუნება' : 'გაუქმება',
      title: 'ნამდვილად გსურს გაყიდვა?',
    };
    // this.router.navigate(['/entity-sales/edit', id]);
    this.approveAction(dialogData).subscribe((res) => {
      console.log('dev => draft accep dialog res:', res);
      console.log('dev => draft accep dialog res===false:', res === false);
      if (res === true) {
        console.log('dev => should send finish requeste because res is:', res);
        const data = {
          id,
        };
        this.client
          .put('entitysaleorders/finish', data)
          .subscribe((response) => {
            console.log('dev => entity sale finish response:', response);
            this._mixpanelService.track('Add B2B Sale (Success)');
            this.notificator.saySuccess('გაყიდვა წარმატებით შესრულდა');
            this.requestItems.next();
          });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('entitySaleId', id);
        }
      }
    });
  }

  onDelete(row?: any, backToQueryParam: boolean = false): void {
    const id =
      (row && row.id) || (this?.selectedRows[0] && this?.selectedRows[0]?.id);
    const dialogData: DialogData = {
      approveBtnLabel: 'წაშლა',
      denyBtnLabel: backToQueryParam ? 'დაბრუნება' : 'გაუქმება',
      title: 'ნამდვილად გსურს წაშლა?',
    };
    // this.router.navigate(['/entity-sales/edit', id]);
    this.approveAction(dialogData).subscribe((res) => {
      console.log('dev => delete accep dialog res:', res);
      console.log('dev => delete accep dialog res===false:', res === false);
      if (res === true) {
        console.log('dev => should send delete requeste because res is:', res);
        const data = row?.id
          ? { ids: [row.id] }
          : { ids: this.selectedRows.map((r) => r.id) };
        this.client.delete('entitysaleorders', data).subscribe(() => {
          this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
          this.requestItems.next();
        });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('entitySaleId', id);
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

  onRSUpload(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.requestIsSent = true;
    this.client
      .post('entitysaleorders/uploadtors', {
        id,
        timeZoneOffset: new Date().getTimezoneOffset().toString(),
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          if (err.status === 400) {
            this.notificator.sayError('RS: დაფიქსირდა შეცდომა');
          }
          return EMPTY;
        }),
        finalize(() => ((this.requestIsSent = false), this.cdr.markForCheck()))
      )
      .subscribe(
        () => {
          this.requestItems.next();
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
        () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      );
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete('entitysaleorders', data);
  }

  get isAnySold(): boolean {
    return this.selectedRows.some(
      (row) => row.status === EntitySaleStatus.Sold
    );
  }

  get isSelectedsDraft(): boolean {
    return this.selectedRows.every(
      (row) => row.status === EntitySaleStatus.Draft
    );
  }

  isRowDraft(row: any): boolean {
    return row.status === EntitySaleStatus.Draft;
  }

  isRowSold = (row: any): boolean => {
    return row.status === EntitySaleStatus.Sold;
  };

  subscribeToDialogActions(): void {
    this.dialogResult
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((action: DialogAction) => {
        console.log('dev => dialog action is:', action);

        switch (action?.actionType) {
          case DialogActionTypes.draftFinish:
            this.onSellDraft({ id: action.id }, true);
            break;
          case DialogActionTypes.delete:
            this.onDelete({ id: action.id }, true);
            break;
          case DialogActionTypes.rsUpload:
            this.onRSUpload({ id: action.id });
            break;
        }
      });
  }
}
