import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';

import { ColumnType, NumberColumnType } from '@optimo/ui-table';

@Component({
  selector: 'app-sale-order-view-dialog',
  templateUrl: './sale-order-view-dialog.component.html',
  styleUrls: ['./sale-order-view-dialog.component.scss'],
})
export class SaleOrderViewDialogComponent implements OnInit {
  itemId: number;
  item: any;
  orderLinesDiplayedColumns = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'თვითღირებულება(₾)',
    },
  ];

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<SaleOrderViewDialogComponent>,
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
        .get(`saleorders/${this.itemId}`)
        .toPromise();

      this.cdr.markForCheck();
    } catch {}
  }
}
