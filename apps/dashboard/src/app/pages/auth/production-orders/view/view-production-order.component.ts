import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import {
  PRODUCTION_ORDER_STATUS_DATA,
  ProductionOrderStatus,
} from 'apps/dashboard/src/app/core/enums/production-order-status.enum';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  IViewAttributeItem,
  ViewAttributeType,
} from '@optimo/ui/view-attributes';
import { DialogActionTypes } from '../../base-list.component';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-view-production-order',
  templateUrl: './view-production-order.component.html',
  styleUrls: ['./view-production-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProductionOrderComponent implements OnInit, OnDestroy {
public textIsTruncated = textIsTruncated;
  PRODUCTION_ORDER_STATUS_DATA = PRODUCTION_ORDER_STATUS_DATA;
  ProductionOrderStatus = ProductionOrderStatus;
  productionOrder$: Observable<any>;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.8,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'GENERAL.UNIT_PRICE',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'ProductionOrders.shortTotalPrice',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private client: ClientService,
    private dialogRef: MatDialogRef<ViewProductionOrderComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('View Preparation');
  }

  getAttributeItems = (productionOrder: any): IViewAttributeItem[] => [
    {
      title: 'GENERAL.STATUS',
      value: PRODUCTION_ORDER_STATUS_DATA[productionOrder.status],
    },
    {
      title: 'GENERAL.DATE',
      value: productionOrder?.orderDate,
      type: ViewAttributeType?.longDateTime,
    },
  ];

  ngOnInit(): void {
    this.productionOrder$ = this.client.get(
      `stockitemproductionorders/${this.itemId}`
    );
  }

  onDelete(id: number): void {
    this.dialogRef.close(
      {
        actionType: DialogActionTypes.delete,
        id: id || this.itemId,
      }
    );
  }

  onEdit(): void {
    this.router.navigate(['/production-orders/edit', this.itemId]).then(() => {
      this.onBack();
    });
  }

  onBack(): void {
    this.dialogRef.close(
      {
        actionType: DialogActionTypes.close,
        id: this.itemId,
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onDraftFinish(id?: number): void {
    this.dialogRef.close(
      {
        actionType: DialogActionTypes.draftFinish,
        id: id || this.itemId,
      }
    );
  }
}
