import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { of, OperatorFunction, Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { Router } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  catchError,
  debounceTime,
  filter,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { approveAction, ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NumberColumnType } from '@optimo/ui-table';
import { IViewAttributeItem } from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-view-supplier',
  templateUrl: './view-supplier.component.html',
  styleUrls: ['./view-supplier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSupplierComponent implements OnInit, OnDestroy {
public textIsTruncated = textIsTruncated;
  supplier: any;

  supplierStockItems: any[];
  supplierStockItemsTotalCount: number;

  stockItemsDisplayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.ITEM.LIST.TABLE_COLUMNS.TITLE',
      filterable: false,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      caption: 'SUPPLIERS.ITEM.LIST.TABLE_COLUMNS.QUANTITY',
      sortable: false,
      filterable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'SUPPLIERS.ITEM.LIST.TABLE_COLUMNS.UNIT_COST',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      sortable: false,
      filterable: false,
      widthCoefficient: 1,
    },
  ];

  private unsubscribe$ = new Subject<void>();
  private requestSupplierItems = new Subject<void>();
  currentState: { [param: string]: string } = {};

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private notificator: NotificationsService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewSupplierComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    	this._mixpanelService.track('View Supplier');
  }

  ngOnInit(): void {
    this.requestSupplierItems
      .pipe(
        debounceTime(200),
        filter(() => this.supplier),
        this.toHttpGetSupplierStockItems,
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({ data, totalCount }) => {
        this.supplierStockItems = data;
        this.supplierStockItemsTotalCount = totalCount;
        this.cdr.markForCheck();
      });
    this.getData();
  }

  get distributorAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.CONTACT_NAME',
        value: this.supplier?.contactName,
      },
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.PHONE_NUMBER',
        value: this.supplier?.phoneNumber,
      },
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.EMAIL',
        value: this.supplier?.email,
      },
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.INN',
        value: this.supplier?.inn,
      },
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.BANK_ACCOUNT_NUMBER',
        value: this.supplier?.bankAccountNumber,
      },
      {
        title: 'SUPPLIERS.ITEM.ATTRIBUTES.IS_VAT_REGISTERED',
        value: this.supplier?.isVATRegistered
          ? 'SUPPLIERS.ITEM.ATTRIBUTES.YES'
          : 'SUPPLIERS.ITEM.ATTRIBUTES.NO',
      },
    ];
  }

  private get toHttpGetSupplierStockItems(): OperatorFunction<void, any> {
    return switchMap(() =>
      this.client
        .get(`suppliers/${this.supplier.id}/stockitems`, {
          params: new HttpParams({
            fromObject: {
              ...this.currentState,
              status: [
                StockItemStatuses.Enabled.toString(),
                StockItemStatuses.Disabled.toString(),
              ],
            },
          }),
        })
        .pipe(
          catchError(() => of({ totalCount: 0, data: [] })),
          takeUntil(this.unsubscribe$)
        )
    );
  }

  private getData(): void {
    this.client
      .get(`suppliers/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((supplier) => {
        this.supplier = supplier;
        this.cdr.markForCheck();
        this.requestSupplierItems.next();
      });
  }

  onBack(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this._locationService
      .getLocations()
      .pipe(
        tap((locations) => console.log('dev => locations =>', locations)),
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: hasMultipleLocations
                ? 'GENERAL.APPROVE_SUPPLIER_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
      )
      .subscribe((res) => {
        this.notificator.saySuccess(
          this.translate.instant('SUPPLIERS.DELETED_SUCCESSFULLY_MESSAGE')
        );
        console.log('dev => itemsDeleted => res:', res);
        this.requestDeleteItems();
      });
  }

  onEdit(): void {
    this.router.navigate(['/suppliers/edit', this.supplier.id]).then(() => {
      this.onBack();
    });
  }

  private requestDeleteItems(): void {
    this.client
      .delete('suppliers', { ids: [this.itemId] })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onTableStateChanged(state: { [param: string]: string }): void {
    this.currentState = state;
    this.requestSupplierItems.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestSupplierItems.complete();
  }
}
