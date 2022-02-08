import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { NumberColumnType } from '@optimo/ui-table';
import { getUMOAcronym } from '../../../../core/enums/measurement-units.enum';
import {
  IViewAttributeItem,
  ViewAttributeType,
} from '@optimo/ui/view-attributes';
import { EntitySaleStatus } from '../../../../core/enums/entity-sale-status.enum';
import { Router } from '@angular/router';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil } from 'rxjs/operators';
import { DialogAction, DialogActionTypes } from '../../base-list.component';
import { MixpanelService } from '@optimo/mixpanel';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-view-entity-sale',
  templateUrl: './view-entity-sale.component.html',
  styleUrls: ['./view-entity-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewEntitySaleComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  getUMOAcronym = getUMOAcronym;
  entitySale$: Observable<any>;
  protected unsubscribe$ = new Subject<void>();
  ENTITY_SALE_STATUS = EntitySaleStatus;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: true,
      widthCoefficient: 1.7,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'GENERAL.UNIT_PRICE',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: true,
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
      sortable: true,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'GENERAL.TOTAL_VALUE',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: false,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    private dialogRef: MatDialogRef<ViewEntitySaleComponent, DialogAction>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('View B2B Sale');
  }

  ngOnInit(): void {
    this.entitySale$ = this.client.get(`entitysaleorders/${this.itemId}`);
  }

  entitySaleAttributeItems = (entitySale: any): IViewAttributeItem[] => {
    const attributes = [
      {
        title: 'GENERAL.PAYMENT_METHOD',
        value: entitySale?.paymentMethodDescription,
      },
      {
        title: 'GENERAL.DATE',
        value: entitySale?.orderDate,
        type: ViewAttributeType.date,
      },
    ];

    if (entitySale?.hasTransportation) {
      attributes.push({
        title: 'ENTITY_SALES.VIEW.TRANSPORTATION_METHOD',
        value: entitySale?.transportationType === 2
          ? 'ENTITY_SALES.VIEW.TRANSPORTATION_METHOD_VALUES.OTHER'
          : 'ENTITY_SALES.VIEW.TRANSPORTATION_METHOD_VALUES.CAR',
      },);
    }

    if (entitySale?.hasTransportation) {
      if (entitySale?.transportationType === 2) {
        attributes.push(
          {
            title: 'ENTITY_SALES.VIEW.TRANSPORT_NAME',
            value: entitySale?.transportName,
          },
          {
            title: 'GENERAL.START_ADDRESS',
            value: entitySale?.startAddress,
          },
          {
            title: 'ENTITY_SALES.VIEW.END_ADDRESS',
            value: entitySale?.endAddress,
          },
        );
      } else {
        // we do not check for transportation 1 in order to support older 
        // data with no such parameter <transportationType>
        attributes.push(
          {
            title: 'ENTITY_SALES.VIEW.DRIVER_FULL_NAME',
            value: entitySale?.driverName,
          },
          {
            title: 'ENTITY_SALES.VIEW.DRIVER_ID_NUMBER',
            value: entitySale?.driverPIN,
          },
          {
            title: 'ENTITY_SALES.VIEW.DRIVER_CAR_NUMBER',
            value: entitySale?.driverCarNumber,
          },
          {
            title: 'GENERAL.START_ADDRESS',
            value: entitySale?.startAddress,
          },
          {
            title: 'ENTITY_SALES.VIEW.END_ADDRESS',
            value: entitySale?.endAddress,
          },
        );
      }
    } else {
      attributes.push({
        title: 'GENERAL.START_ADDRESS',
        value: entitySale?.startAddress,
      },);
    }
    

    return attributes;
  }

  onBack(): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.close,
      id: null,
    });
  }

  onEdit(id: number): void {
    this.router.navigate(['/entity-sales/edit', id]).then(() =>
      this.dialogRef.close({
        actionType: DialogActionTypes.close,
        id: null,
      })
    );
  }

  onDelete(id: number): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.delete,
      id: id || this.itemId,
    });
    // this.dialog
    //   .open(ApproveDialogComponent, {
    //     width: '548px',
    //     data: {
    //       title: `ნამდვილად გსურს წაშლა?`,
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((result) => {
    //     if (result) {
    //       this.client.delete('entitysaleorders', {ids: [id]})
    //         .pipe(
    //           takeUntil(this.unsubscribe$),
    //         )
    //         .subscribe(
    //           () => this.dialogRef.close(
    //             {
    //               actionType: DialogActionTypes.close,
    //               id: null,
    //             }
    //           )
    //         );
    //     }
    // });
  }

  onRsUpload(id?: number): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.rsUpload,
      id: id || this.itemId,
    })
  }

  onDraftFinish(id?: number): void {
    this.dialogRef.close({
      actionType: DialogActionTypes.draftFinish,
      id: id || this.itemId,
    });
  }
}
