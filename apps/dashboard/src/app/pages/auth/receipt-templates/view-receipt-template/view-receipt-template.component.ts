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
import { takeUntil, filter, switchMap, tap, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { IViewAttributeItem } from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
@Component({
  selector: 'app-view-receipt-template',
  templateUrl: './view-receipt-template.component.html',
  styleUrls: ['./view-receipt-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewReceiptTemplateComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  receiptTemplate: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewReceiptTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    this._mixpanelService.track('View Recipe Template');
  }

  templateColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'unitOfMeasurementDescription',
      columnType: ColumnType.Text,
      caption: 'GENERAL.UNIT',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      caption: 'GENERAL.COST',
      filterable: false,
      sortable: true,
    },
  ];

  ngOnInit(): void {
    this.getData();
  }

  get receiptTemplateAttribteItems(): IViewAttributeItem[] {
    return [
      {
        title: 'GENERAL.NAME',
        value: this.receiptTemplate?.name,
      },
      {
        title: 'GENERAL.UNIT',
        value: this.receiptTemplate?.unitOfMeasurementDescription,
      },
      {
        title: 'GENERAL.DESCRIPTION',
        value: this.receiptTemplate?.description,
      },
    ];
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
                ? 'GENERAL.APPROVE_RECEIPT_TEMPLATE_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() =>
          this.client.delete('stockitemreceipttemplate', {
            templateIds: [this.receiptTemplate.id],
          })
        ),
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onEdit(): void {
    console.log(
      'TCL: ViewReceiptTemplateComponent -> onEditttttttttttttt',
      this.receiptTemplate.id
    );
    this.router
      .navigate(['/receipt-templates/edit', this.receiptTemplate.id])
      .then(() => {
        this.close();
      });
  }

  private getData(): void {
    this.client
      .get(`stockitemreceipttemplate/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((receiptTemplate) => {
        this.receiptTemplate = receiptTemplate;
        this.rows = [
          {
            key: 'სახელი',
            value: this.receiptTemplate.name,
          },
          {
            key: 'ერთეული',
            value: this.receiptTemplate.unitOfMeasurementDescription,
          },
          {
            key: 'აღწერა',
            value: this.receiptTemplate.description,
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
