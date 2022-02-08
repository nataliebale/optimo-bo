import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { Router } from '@angular/router';
import { PaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { EditModes } from 'apps/dashboard/src/app/core/enums/edit-modes.enum';
import { OrderStatuses } from 'apps/dashboard/src/app/core/enums/order-status.enum';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import {
  IViewAttributeItem,
  ViewAttributeType,
} from '@optimo/ui/view-attributes';
import { HttpParams } from '@angular/common/http';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';

export interface ScrollState<T> {
  items: T[];
  requestIsSent: boolean;
  allFetched: boolean;
  chunkSize: number;
}

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewOrderComponent implements OnInit, OnDestroy {
public textIsTruncated = textIsTruncated;
  private _order: any;

  private scrollState: ScrollState<any> = {
    requestIsSent: false,
    allFetched: false,
    chunkSize: 20,
    items: [],
  }

  get orderLines(): any[] {
    // console.log('dev => scrollState.items is:', this.scrollState.items);
    // console.log('dev => _order.orderLines is:', this._order.orderLines);
    return this.scrollState.items;
  }

  set order(value: any) {
    this._order = value;

    this.stockItemsDisplayedColumns = [
      {
        dataField: 'stockItemName',
        columnType: ColumnType.Text,
        caption: 'დასახელება',
        filterable: false,
        sortable: true,
        widthCoefficient: 1.5,
      },
      {
        dataField:
          value.status === OrderStatuses.Received
            ? 'receivedQuantity'
            : 'orderedQuantity',
        columnType: ColumnType.Number,
        caption: 'რაოდენობა',
        data: {
          type: NumberColumnType.Quantity,
          UOMFieldName: 'unitOfMeasurement',
        },
        filterable: false,
        sortable: true,
      },
      {
        dataField:
          value.status === OrderStatuses.Received
            ? 'receivedUnitCost'
            : 'expectedUnitCost',
        columnType: ColumnType.Number,
        caption: 'შეს. ფასი',
        data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
        filterable: false,
        sortable: true,
      },
      {
        dataField:
          value.status === OrderStatuses.Received
            ? 'receivedTotalCost'
            : 'expectedTotalCost',
        columnType: ColumnType.Number,
        caption: 'ჯამ. ღირებულება',
        data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
        filterable: false,
        sortable: true,
      },
    ];

    this.cdr.markForCheck();
  }

  get order(): any {
    return this._order;
  }

  supplier: any;

  stockItemsDisplayedColumns: ColumnData[];

  paymentMethods = {
    [PaymentMethods.Other]: 'სხვა',
    [PaymentMethods.Consignation]: 'კონსიგნაცია',
    [PaymentMethods.PrePayment]: 'წინასწარ გადახდა',
  };

  editModes = EditModes;
  orderStatuses = OrderStatuses;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewOrderComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('View Purchase');
  }

  get orderAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'მომწოდებლი',
        value: this.order?.supplierName,
      },
      {
        title: 'საკონტაქტო პირი',
        value: this.supplier?.contactName,
      },
      {
        title: 'გადახდის მეთოდი',
        value: this.paymentMethods[this.order?.paymentMethod],
      },
      {
        title: 'მოსვლის თარიღი',
        value: this.order?.expectedReceiveDate,
        type: ViewAttributeType.date,
      },
    ];
  }

  ngOnInit(): void {
    this.getData();
  }

  private getData(): void {
    this.client
      .get<any>(`purchaseorders/${this.itemId}`)
      .pipe(
        tap(order => this.order = order),
        switchMap(
          order => this.client.get(`suppliers/${order.supplierId}`)
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((supplier) => {
        this.supplier = supplier;
        this.cdr.markForCheck();
      });
    this.fetchOrderLines(this.scrollState);
  }

  fetchOrderLines(scrollState: ScrollState<any>): void {
    this.client.get(`purchaseorders/orderlines/${this.itemId}`, {
      params: new HttpParams({fromObject: {
        skip: scrollState.items.length.toString(),
        take: '20',
      }}),
      service: Service.Main,
    })
      .pipe(
        tap(_ => scrollState.requestIsSent = true),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((orderLines: any[])  => {
        console.log('dev => fetched items:', orderLines);
        scrollState.allFetched = orderLines.length < scrollState.chunkSize;
        scrollState.items = [...scrollState.items, ...orderLines];
        scrollState.requestIsSent = false;
        console.log('dev => scrollState.items.length', scrollState.items.length);
        this.cdr.detectChanges();
      });
  }

  onScroll() {
    console.log('dev => onScroll', 123);
    this.fetchOrderLines(this.scrollState);
  }

  onBack(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          // message: `ნამდვილად გსურს ${this.order.name} წაშლა?`,
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((r) => {
        if (r) {
          this.requestDeleteItems();
        }
      });
  }

  onEdit(): void {
    this.router
      .navigate(['/orders/edit', this.order.id, EditModes.Edit])
      .then(() => {
        this.onBack();
      });
  }

  private requestDeleteItems(): void {
    this.client
      .delete('purchaseorders', { ids: [this.itemId] })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onExcelDownload() {
    window.open(this._order.importedFileUrl);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
