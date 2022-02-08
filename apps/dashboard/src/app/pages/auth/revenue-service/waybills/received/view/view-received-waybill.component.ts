import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { RSVATTypes } from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { keyBy, mapValues } from 'lodash-es';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { IViewAttributeItem } from '@optimo/ui/view-attributes';

@Component({
  selector: 'app-view-received-waybill',
  templateUrl: './view-received-waybill.component.html',
  styleUrls: ['./view-received-waybill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewReceivedWaybillComponent implements OnInit, OnDestroy {
  waybill: any;
  dataSource: any[];
  displayedColumns: ColumnData[];
  private unsubscribe$ = new Subject<void>();
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ViewReceivedWaybillComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUnits();
    this.getData();
  }

  private getUnits(): void {
    this.client
      .get(`waybills/units`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((units: Array<{ id: string; name: string }>) => {
        const mapOfunits = mapValues(keyBy(units, 'id'), (u) => u.name);
        this.displayedColumns = [
          {
            dataField: 'barcode',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.BARCODE',
            filterable: false,
            sortable: true,
            widthCoefficient: 1.5,
          },
          {
            dataField: 'wName',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.WB_NAME',
            filterable: false,
            sortable: true,
          },
          {
            dataField: 'unitId',
            columnType: ColumnType.Dropdown,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.UNIT_OF_MEASUREMENT',
            filterable: false,
            sortable: true,
            data: mapOfunits,
          },
          {
            dataField: 'quantity',
            columnType: ColumnType.Number,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.QUANTITY',

            data: {
              type: NumberColumnType.Quantity,
            },
            filterable: false,
            sortable: true,
          },
          {
            dataField: 'unitPrice',
            columnType: ColumnType.Number,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.UNIT_PRICE',
            data: {
              type: NumberColumnType.Decimal,
              digitsAfterDot: 4,
            },
            filterable: false,
            sortable: true,
          },
          {
            dataField: 'totalPrice',
            columnType: ColumnType.Number,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.TOTAL_COST',
            data: {
              type: NumberColumnType.Decimal,
              digitsAfterDot: 4,
            },
            filterable: false,
            sortable: true,
          },
          {
            dataField: 'vatType',
            columnType: ColumnType.Dropdown,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.LIST.TABLE_COLUMNS.WAT_TYPE',
            filterable: false,
            sortable: true,
            data: RSVATTypes,
          },
        ];
        this.cdr.markForCheck();
      });
  }

  get waybillAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'WAYBILLS.RECEIVED_WAYBILLS.ITEM.ATTRIBUTES.SELLER_NAME',
        value: this.waybill?.sellerName,
      },
      {
        title: 'WAYBILLS.RECEIVED_WAYBILLS.ITEM.ATTRIBUTES.SELLER_INN',
        value: this.waybill?.sellerTIN,
      },
      {
        title: 'WAYBILLS.RECEIVED_WAYBILLS.ITEM.ATTRIBUTES.END_ADDRESS',
        value: this.waybill?.endAddress,
      },
    ];
  }

  private getData(): void {
    this.client
      .get<any>('waybills', {
        params: new HttpParams({
          fromObject: {
            number: this.itemId,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((item) => {
        this.waybill = item;
        this.dataSource = item.goods;
        this.cdr.markForCheck();
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.router
      .navigate(['/rs/waybills/edit', this.waybill.waybillNumber])
      .then(() => {
        this.close();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
