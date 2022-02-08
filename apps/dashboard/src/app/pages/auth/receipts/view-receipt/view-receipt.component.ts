import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { approveAction, ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil, filter, switchMap, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import {
  getUMOAcronym,
  getUMOFullName,
} from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { NumberColumnType } from '@optimo/ui-table';
import { IViewAttributeItem } from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
@Component({
  selector: 'app-view-receipt',
  templateUrl: './view-receipt.component.html',
  styleUrls: ['./view-receipt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewReceiptComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  receipt: any;
  rows: Array<{ key: string; value: string }>;
  getUMOFullName = getUMOFullName;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewReceiptComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    this._mixpanelService.track('View Recipe');
  }

  templateColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'unitOfMeasurement',
      columnType: ColumnType.Text,
      caption: 'ერთეული',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'unitCostAVG',
      columnType: ColumnType.Number,
      caption: 'ღირებულება',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: true,
    },
  ];

  get receiptAttributeItems(): IViewAttributeItem[] {
    const receipt = this.receipt;
    return [
      {
        title: 'GENERAL.NAME',
        value: receipt?.name,
      },
      {
        title: 'GENERAL.UNIT',
        value: receipt?.unitOfMeasurementDescription,
      },
      {
        title: 'GENERAL.BARCODE',
        value: receipt?.barcode,
      },
      {
        title: 'GENERAL.DESCRIPTION',
        value: receipt?.description,
      },
    ];
  }

  ngOnInit(): void {
    this.getData();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this._locationService
      .getLocations()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: hasMultipleLocations
                ? 'GENERAL.APPROVE_RECEIPT_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() =>
          this.client.delete('stockitemreceipt', {
            recetipIds: [this.receipt.id],
          })
        ),
      )
      .subscribe((res) => {
        console.log('dev => itemsDeleted => res:', res);
        this.dialogRef.close(true);
      });
  }

  onEdit(): void {
    this.router.navigate(['/receipts/edit', this.receipt.id]).then(() => {
      this.close();
    });
  }

  private getData(): void {
    this.client
      .get<any>(`stockitemreceipt/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((receipt) => {
        receipt.items.map((item) => {
          item.unitOfMeasurementDescription = getUMOAcronym(
            item.unitOfMeasurement
          );
          return item;
        });

        this.receipt = receipt;
        this.rows = [
          {
            key: 'სახელი',
            value: this.receipt.name,
          },
          {
            key: 'ერთეული',
            value: this.receipt.unitOfMeasurementDescription,
          },
          {
            key: 'ბარკოდი',
            value: this.receipt.barcode,
          },
          {
            key: 'აღწერა',
            value: this.receipt.description,
          },
        ];

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
