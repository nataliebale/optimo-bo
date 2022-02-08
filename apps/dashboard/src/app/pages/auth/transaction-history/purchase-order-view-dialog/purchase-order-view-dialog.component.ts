import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { ClientService } from '@optimo/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColumnType, NumberColumnType } from '@optimo/ui-table';

@Component({
  selector: 'app-purchase-order-view-dialog',
  templateUrl: './purchase-order-view-dialog.component.html',
  styleUrls: ['./purchase-order-view-dialog.component.scss'],
})
export class PurchaseOrderViewDialogComponent implements OnInit {
  itemId: number;
  item: any;
  stockItemsDiplayedColumns = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
    {
      dataField: 'orderedQuantity',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
    },
    {
      dataField: 'expectedUnitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'თვითღირებულება(₾)',
    },
    {
      dataField: 'receivedQuantity',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
    },
    {
      dataField: 'receivedUnitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'თვითღირებულება(₾)',
    },
  ];

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<PurchaseOrderViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  ) {
    this.itemId = data;
  }

  ngOnInit() {
    this.getData();
  }

  async getData() {
    try {
      this.item = await this.client
        .get(`purchaseorders/${this.itemId}`)
        .toPromise();
      // this.item.receiveDate = moment(this.item.receiveDate).format(
      //   'dd/MM/yyyy'
      // );

      this.cdr.detectChanges();
    } catch {}
  }
}
