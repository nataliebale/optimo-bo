import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import {
  OrderStatuses,
  orderStatusData,
} from 'apps/dashboard/src/app/core/enums/order-status.enum';
import { ClientService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { ReceivedWaybillEditNewOrderComponent } from '../new-order/received-waybill-edit-new-order.component';

@Component({
  selector: 'app-received-waybill-edit-existing-order',
  templateUrl: './received-waybill-edit-existing-order.component.html',
  styleUrls: ['./received-waybill-edit-existing-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivedWaybillEditExistingOrderComponent
  implements OnInit, OnDestroy {
  private _purchaseOrderId: number;

  set purchaseOrderId(value: number) {
    this._purchaseOrderId = value;

    if (value) {
      this.getPurchaseOrderById(value)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((purchaseOrder) => {
          this.data.purchaseOrder = purchaseOrder;
        });
    }
  }

  get purchaseOrderId(): number {
    return this._purchaseOrderId;
  }

  dataSource: any[];
  selectedPurchaseOrder: any;
  columns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption:
        'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.ORDERS',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption:
        'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.STATUS',
      filterable: false,
      sortable: false,
      data: orderStatusData,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<ReceivedWaybillEditExistingOrderComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    let params = new HttpParams({
      fromObject: {
        supplierId: this.data.supplierId,
        sortField: 'name',
        sortOrder: 'DESC',
        pageSize: '1000',
        pageIndex: '0',
      },
    });
    params = params
      .append('status', `${OrderStatuses.Ordered}`)
      .append('status', `${OrderStatuses.Delayed}`);

    this.client
      .get('purchaseorders', { params })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        this.dataSource = data;
        console.log(
          'TCL: WaybillEditExistingOrderComponent -> this.dataSource',
          this.dataSource
        );
        this.cdr.markForCheck();
      });
  }

  onNextStep(): void {
    this.dialog.open(ReceivedWaybillEditNewOrderComponent, {
      width: '548px',
      data: this.data,
      panelClass: 'waybills-dialog',
    });
    this.dialogRef.close();
  }

  getPurchaseOrderById = (id: number): Observable<any> => {
    return this.client.get(`purchaseorders/${id}`);
  };

  onSelectionChanged(selectionData: SelectionData): void {
    if (selectionData.selected && selectionData.selected[0]) {
      this.purchaseOrderId = selectionData.selected[0].id;
    }
  }

  isRowSelectable = (row): boolean => true;

  onClose(): void {
    this.dialogRef.close();
  }

  onBack(): void {
    this.dialogRef.close(true);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
