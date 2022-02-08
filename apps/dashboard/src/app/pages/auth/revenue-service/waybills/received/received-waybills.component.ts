import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { Observable, EMPTY, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  ColumnType,
  ColumnData,
  TableComponent,
  NumberColumnType,
} from '@optimo/ui-table';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { LoadingPopupComponent } from 'apps/dashboard/src/app/popups/loading-popup/loading-popup.component';
import { BaseListComponent } from '../../../base-list.component';
import { waybillTypeData } from 'apps/dashboard/src/app/core/enums/waybill-type.enum';
import decode from 'jwt-decode';
import { StorageService } from '@optimo/core';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-received-waybills',
  templateUrl: './received-waybills.component.html',
  styleUrls: ['./received-waybills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivedWaybillsComponent extends BaseListComponent
  implements OnInit {
  public textIsTruncated = textIsTruncated;
  @ViewChild(TableComponent, { static: true })
  table: TableComponent;
  waybillTypeData = waybillTypeData;

  statusData = {
    0: 'შენახული', // grey
    1: 'აქტიური', // yellow
    2: 'დასრულებული', // green
    [-2]: 'გაუქმებული', // red
  };
  conditionData = {
    0: 'მისაღები',
    1: 'მიღებული',
    [-1]: 'უარყოფილი',
  };
  private all: boolean;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'waybillNumber',
      columnType: ColumnType.Text,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.WAYBILL_NUMBER',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'isConfirmed',
      columnType: ColumnType.Dropdown,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.IS_CONFIRMED',
      filterable: true,
      sortable: true,
      data: this.conditionData,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.STATUS',
      filterable: true,
      sortable: true,
      data: this.statusData,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.TYPE',
      filterable: true,
      sortable: true,
      data: waybillTypeData,
    },
    {
      dataField: 'sellerName',
      columnType: ColumnType.Text,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.SELLER_NAME',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'fullAmount',
      columnType: ColumnType.Number,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.FULL_AMOUNT',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 2 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'activateDate',
      columnType: ColumnType.Date,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.ACTIVATE_DATE',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'deliveryDate',
      columnType: ColumnType.Date,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.DELIVERY_DATE',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'endAddress',
      columnType: ColumnType.Text,
      caption: 'WAYBILLS.RECEIVED_WAYBILLS.LIST.TABLE_COLUMNS.END_ADDRESS',
      filterable: true,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    private storage: StorageService,
    notificator: NotificationsService,
    private translate: TranslateService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router
  ) {
    super(notificator, cdr, route, dialog, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ all }) => {
        this.all = all;
        this.table.loading = true; // todo
        this.table.cdr.markForCheck();
        this.requestItems.next();
      });
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get('waybills/received', {
        params: new HttpParams({
          fromObject: {
            ...this.currentState,
            lastThreeDays: (!this.all).toString(),
          },
        }),
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          if (err.status === 500) {
            this.notificator.sayError(
              this.translate.instant('WAYBILLS.RS_ERROR_MESSAGE')
            );
          }
          return EMPTY;
        }),
        finalize(() => {
          this.table.loading = false;
          this.table.cdr.markForCheck();
        })
      );
  }

  goToEdit(row: any): void {
    console.log('TCL: ReceivedWaybillsComponent -> row', row);
    if (row.isCorrected) {
      this.router.navigate(['/rs/waybills/edit/', row.waybillNumber]);
      return;
    }
    const request = this.client.get('purchaseorders/waybillnumber/received', {
      params: new HttpParams({
        fromObject: { waybillNumber: row.waybillNumber },
      }),
    });
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'WAYBILLS.IMPORT_LOADING_FROM_RS',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((receivedOrderId) => {
        const accessToken = this.storage.getAccessToken();
        const tokenPayload = decode(accessToken);
        if (receivedOrderId && !tokenPayload.isAdmin) {
          this.router.navigate(['/orders'], {
            queryParams: { orderId: receivedOrderId },
          });
        } else {
          this.router.navigate(['/rs/waybills/edit/', row.waybillNumber]);
        }
      });
  }
}
