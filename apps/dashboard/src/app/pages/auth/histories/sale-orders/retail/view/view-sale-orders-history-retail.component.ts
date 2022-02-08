import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import { IViewAttributeItem, ViewAttributeType } from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { Router } from '@angular/router';
import { MapOfSaleReturnReasonLabels, SaleReturnReason } from 'apps/dashboard/src/app/core/enums/SaleReturnReason';
@Component({
  selector: 'app-view-sale-orders-history-retail',
  templateUrl: './view-sale-orders-history-retail.component.html',
  styleUrls: ['./view-sale-orders-history-retail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSaleOrdersHistoryRetailComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  saleOrder: any;

  stockItemsDisplayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.View.TableColumns.stockItemName',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      caption: 'SaleOrdersHistory.View.TableColumns.quantity',
      sortable: false,
      filterable: false,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.View.TableColumns.totalPrice',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      sortable: false,
      filterable: false,
    },
  ];

  get orderAttributeItems(): IViewAttributeItem[] {
    const returnReason = MapOfSaleReturnReasonLabels.get(this.saleOrder?.returnReason);
    return [
      {
        title: 'SaleOrdersHistory.View.Attributes.operatorName',
        value: this.saleOrder?.operatorName,
      },
      {
        title: 'SaleOrdersHistory.View.Attributes.paymentMethodDescription',
        value: this.saleOrder?.paymentMethodDescription,
      },
      {
        title: 'SaleOrdersHistory.View.Attributes.orderDate',
        value: this.saleOrder?.orderDate,
        type: ViewAttributeType.dateTime
      },
      ...(returnReason
        ? [{
            title: 'SaleOrdersHistory.View.Attributes.returnReason',
            value: 'SaleOrdersHistory.View.Attributes.SaleOrderReturnReasons.' + returnReason,
          }]
        : []
      )
    ];
  }

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ViewSaleOrdersHistoryRetailComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  get retailSaleOrderAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'სახელი',
        value: this.saleOrder?.operatorName
      }
    ]
  }

  private getData(): void {
    this.client
      .get(`saleorders/${this.itemId}/grouped`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((saleOrder) => {
        this.saleOrder = saleOrder;
        this.cdr.markForCheck();
      });
  }

  goToSaleOrder(saleOrderId: number): void {
    this._router.navigate([], {
      queryParams: { ['saleOrderId']: saleOrderId },
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  onBack(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
