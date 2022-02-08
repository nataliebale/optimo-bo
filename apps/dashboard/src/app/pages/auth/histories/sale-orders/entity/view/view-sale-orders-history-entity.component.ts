import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData, NumberColumnType } from '@optimo/ui-table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { IViewAttributeItem, ViewAttributeType } from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-view-sale-orders-history-entity',
  templateUrl: './view-sale-orders-history-entity.component.html',
  styleUrls: ['./view-sale-orders-history-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSaleOrdersHistoryEntityComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  getUMOAcronym = getUMOAcronym;
  entitySale$: Observable<any>;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'SaleOrdersHistory.View.TableColumns.stockItemName',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.View.TableColumns.unitPrice',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4},
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'SaleOrdersHistory.View.TableColumns.quantity',
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
      caption: 'SaleOrdersHistory.View.TableColumns.totalPriceEntity',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
  ];

  constructor(
    private client: ClientService,
    private dialogRef: MatDialogRef<ViewSaleOrdersHistoryEntityComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number
  ) {}

  entitySaleAttributeItems = (entitySale:any): IViewAttributeItem[] => [
    {
      title: 'SaleOrdersHistory.View.Attributes.paymentMethodDescriptionEntity',
      value: entitySale.paymentMethodDescription,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.orderDate',
      value: entitySale.orderDate,
      type: ViewAttributeType.date,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.startAddress',
      value: entitySale.startAddress,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.startAddress',
      value: entitySale.startAddress,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.endAddress',
      value: entitySale.endAddress,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.driverPIN',
      value: entitySale.driverPIN,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.driverName',
      value: entitySale.driverName,
    },
    {
      title: 'SaleOrdersHistory.View.Attributes.driverCarNumber',
      value: entitySale.driverCarNumber,
    },    
  ]

  ngOnInit(): void {
    this.entitySale$ = this.client.get(`entitysaleorders/${this.itemId}/grouped`);
  }

  onBack(): void {
    this.dialogRef.close(false);
  }
}
