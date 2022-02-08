import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-inventory-item-lots',
  templateUrl: './add-inventory-item-lots.component.html',
  styleUrls: ['./add-inventory-item-lots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInventoryItemLotsComponent {
  @Input()
  set stockItemId(value: number) {
    this.lots$ = this.client.get(`stockitems/${value}/holdinglots`);
  }

  lots$: Observable<any[]>;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.DISTRIBUTOR',
      filterable: false,
      sortable: false,
      widthCoefficient: 2.3,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'INVENTORY.UNIT_COST_SHORT',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'receiveDate',
      columnType: ColumnType.Date,
      caption: 'GENERAL.DATE',
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
  ];

  constructor(private client: ClientService) {}
}
