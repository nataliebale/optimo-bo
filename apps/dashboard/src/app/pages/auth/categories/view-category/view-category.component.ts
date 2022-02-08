import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  Inject,
} from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientService, RoutingStateService } from '@optimo/core';
import {
  takeUntil,
  filter,
  debounceTime,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { OperatorFunction, of, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { ViewOrderComponent } from '../../orders/view-order/view-order.component';
import { NumberColumnType } from '@optimo/ui-table';
import {
  IViewAttributeItem,
  ViewAttributeType,
} from '@optimo/ui/view-attributes';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-view-category',
  templateUrl: './view-category.component.html',
  styleUrls: ['./view-category.component.scss'],
})
export class ViewCategoryComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  category: any;
  categoryStockItems: any[];
  categoryStockItemsTotalCount: number;
  stockItemsDisplayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'CATEGORIES.ITEM.TABLECOLUMNS.TITLE',
      filterable: false,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'CATEGORIES.ITEM.TABLECOLUMNS.QUANTITY',
      sortable: true,
      filterable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      caption: 'CATEGORIES.ITEM.TABLECOLUMNS.UNITCOST',
      sortable: true,
      filterable: false,
      widthCoefficient: 1,
    },
  ];

  private unsubscribe$ = new Subject<void>();
  private requestCategoryStockItems = new Subject<void>();
  currentState: { [param: string]: string } = {};

  private itemId: number;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private _mixpanelService: MixpanelService,
  ) {
    this.itemId = this.data;
    this._mixpanelService.track('View Category');
  }

  ngOnInit() {
    this.requestCategoryStockItems
      .pipe(
        filter(() => this.category),
        debounceTime(200),
        this.toHttpGetCategoryStockItems,
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({ data, totalCount }) => {
        this.categoryStockItems = data;
        this.categoryStockItemsTotalCount = totalCount;
        this.cdr.markForCheck();
      });
    this.getData();
  }

  get categoryAttributeItems(): IViewAttributeItem[] {
    return [
      {
        title: 'CATEGORIES.ITEM.CATEGORYATTRIBUTEITEMS.TOTALQUANTITYONHAND',
        value: this.category?.totalQuantityOnHand,
      },
      {
        title: 'CATEGORIES.ITEM.CATEGORYATTRIBUTEITEMS.TOTALCOST',
        value: this.category?.totalCost,
        type: ViewAttributeType.currency,
      },
      {
        title: 'CATEGORIES.ITEM.CATEGORYATTRIBUTEITEMS.ASSORTMENT',
        value: this.category?.stockItemsCount,
      },
    ];
  }

  private get toHttpGetCategoryStockItems(): OperatorFunction<void, any> {
    return switchMap(() =>
      this.client
        .get('stockitems', {
          params: new HttpParams({
            fromObject: {
              ...this.currentState,
              status: [
                StockItemStatuses.Enabled.toString(),
                StockItemStatuses.Disabled.toString(),
              ],
              categoryId: this.itemId.toString(),
            },
          }),
        })
        .pipe(
          catchError(() => of({ totalCount: 0, data: [] })),
          takeUntil(this.unsubscribe$)
        )
    );
  }

  onTableStateChanged(state: { [param: string]: string }): void {
    this.currentState = state;
    this.requestCategoryStockItems.next();
  }

  back() {
    this.dialogRef.close(false);
  }

  onEdit() {
    this.dialog
      .open(AddCategoryDialogComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
        data: this.itemId,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.getData();
        }
      });
  }

  onDelete() {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(async (r) => {
        if (r) {
          await this.client
            .delete('stockitemcategories', {
              ids: [this.category.id],
            })
            .toPromise();
          this.dialogRef.close(true);
        }
      });
  }

  goToSupplier(supplierId) {
    this.router
      .navigate(['suppliers'], { queryParams: { supplierId } })
      .then(() => {
        this.dialogRef.close(false);
      });
  }

  goToStockItem(inventoryId) {
    this.router
      .navigate(['inventory'], { queryParams: { inventoryId } })
      .then(() => {
        this.dialogRef.close(false);
      });
  }

  private async getData() {
    try {
      this.category = await this.client
        .get(`stockitemcategories/${this.itemId}`)
        .toPromise();

      this.requestCategoryStockItems.next();

      this.cdr.detectChanges();
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestCategoryStockItems.complete();
  }
}
