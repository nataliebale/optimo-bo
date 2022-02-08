import { TranslateService } from '@ngx-translate/core';
import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { Observable, EMPTY } from 'rxjs';
import {
  ColumnType,
  ColumnData,
  TableComponent,
  NumberColumnType,
} from '@optimo/ui-table';
import { HttpParams } from '@angular/common/http';
import { BaseListComponent } from '../../../base-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '../../../../../core/services/notifications/notifications.service';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-issued-waybills',
  templateUrl: './issued-waybills.component.html',
  styleUrls: ['./issued-waybills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuedWaybillsComponent extends BaseListComponent
  implements OnInit {
  @ViewChild(TableComponent, { static: true })
  table: TableComponent;

  private all: boolean;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'waybillNumber',
      columnType: ColumnType.Text,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.WAYBILL_NUMBER',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'isConfirmed',
      columnType: ColumnType.Dropdown,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.IS_CONFIRMED',
      filterable: true,
      sortable: true,
      data: {
        0: 'მისაღები',
        1: 'მიღებული',
        [-1]: 'უარყოფილი',
      },
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.STATUS',
      filterable: true,
      sortable: true,
      data: {
        0: 'შენახული',
        1: 'აქტიური',
        2: 'დასრულებული',
        [-2]: 'გაუქმებული',
      },
    },
    {
      dataField: 'sellerName',
      columnType: ColumnType.Text,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.SELLER_NAME',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'fullAmount',
      columnType: ColumnType.Number,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.FULL_AMOUNT',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 2 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'activateDate',
      columnType: ColumnType.Date,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.ACTIVATE_DATE',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'deliveryDate',
      columnType: ColumnType.Date,
      caption: 'WAYBILLS.ISSUED_WAYBILLS.LIST.TABLE_COLUMNS.DELIVERY_DATE',
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
    private translate: TranslateService
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
      .get('waybills/issued', {
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
}
