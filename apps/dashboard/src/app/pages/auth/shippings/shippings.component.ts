import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { EMPTY, Observable } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import {
  BaseListComponent,
  DialogAction,
  DialogActionTypes,
} from '../base-list.component';
import {
  ShippingStatuses,
  shippingStatusData,
} from 'apps/dashboard/src/app/core/enums/shipping-status.enum';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import {
  ApproveDialogComponent,
  DialogData,
} from '@optimo/ui-popups-approve-dialog';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
@Component({
  selector: 'app-shippings',
  templateUrl: './shippings.component.html',
  styleUrls: ['./shippings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingsComponent extends BaseListComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  statusData = shippingStatusData;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'Shipping.List.TableColumns.name',
      filterable: true,
      sortable: true,
      widthCoefficient: 2.5,
    },
    {
      dataField: 'locationNameFrom',
      columnType: ColumnType.Text,
      caption: 'Shipping.List.TableColumns.locationNameFrom',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'locationNameTo',
      columnType: ColumnType.Text,
      caption: 'Shipping.List.TableColumns.locationNameTo',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'Shipping.List.TableColumns.status',
      filterable: true,
      sortable: true,
      data: this.statusData,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'Shipping.List.TableColumns.orderDate',
      filterable: true,
      sortable: true,
    },
  ];
  requestIsSent: boolean;

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Stock Transfers');
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
        .append('status', ShippingStatuses.Draft.toString())
        .append('status', ShippingStatuses.Shipped.toString())
        .append('status', ShippingStatuses.SucceededUploadedToRS.toString());
    }

    return this.client.get('stocktransferorders', { params });
  }

  onEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/shippings/edit', id]);
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete('stocktransferorders', data);
  }

  get isAnyShipped(): boolean {
    return this.selectedRows.some(
      (row) => row.status === ShippingStatuses.Shipped
    );
  }

  get hasTransportation(): boolean {
    return this.selectedRows.some((row) => row.hasTransportation === true);
  }

  isRowDraft(row: any): boolean {
    return row.status === ShippingStatuses.Draft;
  }

  isRowUploadedToRS = (row: any): boolean => {
    return row.status !== ShippingStatuses.SucceededUploadedToRS;
  };

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
    const id = row?.id || (this?.selectedRows[0] && this?.selectedRows[0]?.id);
    const dialogData: DialogData = {
      approveBtnLabel: 'გადაზიდვა',
      denyBtnLabel: backToQueryParam ? 'დაბრუნება' : 'გაუქმება',
      title: 'ნამდვილად გსურს გადაზიდვა?',
    };
    // this.router.navigate(['/entity-sales/edit', id]);

    const request = this.client.put<any>('stocktransferorders/finish', {
      id,
    });
    this.approveAction(dialogData).subscribe((res) => {
      if (res === true) {
        // console.log('dev => should send finish requeste because res is:', res);
        // const data = {
        //   id,
        // };
        // this.client
        //   .put('stocktransferorders/finish', data)
        //   .subscribe((response) => {
        //     console.log('dev => stock transfer finish response:', response);
        //     this.notificator.saySuccess('გადაზიდვა წარმატებით შესრულდა');
        //     this.requestItems.next();
        //   });
        this.dialog
          .open(LoadingPopupComponent, {
            width: '548px',
            data: {
              observable: request,
              message: 'მიმდინარეობს პროდუქტების გადაზიდვა',
            },
          })
          .afterClosed()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(() => {
            this._mixpanelService.track('Add Stock Transfer (Success)');
            this.notificator.saySuccess('გადაზიდვა წარმატებით შესრულდა');
            this.requestItems.next();
          });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('shippingId', id);
        }
      }
    });

    // let params: HttpParams;
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
      if (res === true) {
        console.log('dev => should send delete requeste because res is:', res);
        const data = row?.id
          ? { ids: [row.id] }
          : { ids: this.selectedRows.map((r) => r.id) };
        this.client.delete('stocktransferorders', data).subscribe(() => {
          this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
          this.requestItems.next();
        });
      } else if (res === false) {
        if (backToQueryParam === true) {
          this.toQueryParam('shippingId', id);
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

  alwaysEnable = () => true;

  onRSUpload(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.requestIsSent = true;
    this.client
      .post('stocktransferorders/uploadtors', {
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
}
