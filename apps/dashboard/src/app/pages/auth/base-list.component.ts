import { ColumnData, SelectionData } from '@optimo/ui-table';
import { Observable, of, OperatorFunction, scheduled, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { ViewInventoryItemComponent } from './inventory/view-inventory-item/view-inventory-item.component';
import { ViewCategoryComponent } from './categories/view-category/view-category.component';
import { ViewSupplierComponent } from './suppliers/view-supplier/view-supplier.component';
import { ChangeDetectorRef, OnDestroy, OnInit, Directive } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotificationsService } from '../../core/services/notifications/notifications.service';
import { ViewOrderComponent } from './orders/view-order/view-order.component';
import { ViewReceivedWaybillComponent } from './revenue-service/waybills/received/view/view-received-waybill.component';
import { ViewShippingComponent } from './shippings/view/view-shipping.component';
import { ViewInventorisationComponent } from './inventorisations/view/view-inventorisation.component';
import { ViewIngredientComponent } from './ingredients/view-ingredient/view-ingredient.component';
import { ViewReceiptTemplateComponent } from './receipt-templates/view-receipt-template/view-receipt-template.component';
import { ViewEntitySaleComponent } from './entity-sales/view/view-entity-sale.component';
import { ViewProductionOrderComponent } from './production-orders/view/view-production-order.component';
import { ViewReceiptComponent } from './receipts/view-receipt/view-receipt.component';
import { mapValues, isEmpty, isEqual } from 'lodash-es';
import { ViewSaleOrdersHistoryRetailComponent } from './histories/sale-orders/retail/view/view-sale-orders-history-retail.component';
import { ViewSaleOrdersHistoryEntityComponent } from './histories/sale-orders/entity/view/view-sale-orders-history-entity.component';
import { LocationService } from '../../core/services/location/location.service';

export enum DialogActionTypes {
  edit = 'edit',
  delete = 'delete',
  draftFinish = 'draftFinish',
  close = 'close',
  rsUpload = 'rsUpload',
}

export interface DialogAction {
  actionType: DialogActionTypes;
  id: number;
}

@Directive()
export abstract class BaseListComponent implements OnInit, OnDestroy {
  dataSource: any[];
  abstract displayedColumns: ColumnData[];
  totalCount: number;
  selectedRows = []; // I hope it won't be a problem
  // selectedRows: any[];

  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();
  currentState: { [param: string]: string | number | Array<any> };
  protected deletePopupMessage: string;
  protected nameField = 'name';

  protected dialogResult = new Subject<DialogAction>();

  private openedView: MatDialogRef<any, any>;
  private emptyViewQueryParams = {
    inventoryId: null,
    categoryId: null,
    supplierId: null,
    orderId: null,
    waybillId: null,
    saleOrderId: null,
    entitySaleOrderId: null,
    shippingId: null,
    inventorisationId: null,
    ingredientId: null,
    receiptTemplateId: null,
    entitySaleId: null,
    productionOrderId: null,
    receiptId: null,
  };

  constructor(
    protected notificator: NotificationsService,
    protected cdr: ChangeDetectorRef,
    protected route: ActivatedRoute,
    protected dialog: MatDialog,
    protected router: Router
  ) {
    // this.router.events  //todo
    //   .pipe(
    //     filter(event => event instanceof NavigationEnd),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe(e => {
    //     const url = (e as NavigationEnd).urlAfterRedirects;
    //     if (
    //       (e as NavigationEnd).id > 1 &&
    //       !url.includes('/add') &&
    //       !url.includes('/edit') &&
    //       !url.includes('/receive') &&
    //       !url.includes('/duplicate')
    //     ) {
    //       this.requestItems.next();
    //     }
    //   });
  }

  ngOnInit(): void {
    this.listenRequestDemand();
    this.listenQueryParams();
  }

  private listenRequestDemand(): void {
    this.requestItems
      .pipe(
        debounceTime(200),
        this.toHttpGetItems,
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({ data, totalCount }) => {
        this.dataSource = data;
        this.totalCount = totalCount;
        this.cdr.markForCheck();
      });
  }

  private listenQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ({
          inventoryId,
          categoryId,
          supplierId,
          orderId,
          waybillId,
          saleOrderId,
          entitySaleOrderId,
          shippingId,
          inventorisationId,
          ingredientId,
          receiptTemplateId,
          entitySaleId,
          productionOrderId,
          receiptId,
          ...rest
        }) => {
          if (inventoryId) {
            this.openView(ViewInventoryItemComponent, inventoryId, [
              'mat-w-688',
              'mat-h-478',
            ]);
          } else if (categoryId) {
            this.openView(ViewCategoryComponent, categoryId, [
              'mat-w-800',
              'mat-h-619',
            ]);
          } else if (supplierId) {
            this.openView(ViewSupplierComponent, supplierId, [
              'mat-w-800',
              'mat-h-619',
            ]);
          } else if (orderId) {
            this.openView(ViewOrderComponent, orderId);
          } else if (waybillId) {
            this.openView(ViewReceivedWaybillComponent, waybillId, [
              'mat-w-1024',
              'mat-h-623',
            ]);
          } else if (saleOrderId) {
            this.openView(ViewSaleOrdersHistoryRetailComponent, saleOrderId, [
              'mat-w-800',
              'mat-h-543',
            ]);
          } else if (entitySaleOrderId) {
            this.openView(
              ViewSaleOrdersHistoryEntityComponent,
              entitySaleOrderId,
              ['mat-w-800', 'mat-h-626']
            );
          } else if (shippingId) {
            this.openView(ViewShippingComponent, shippingId, [
              'mat-w-800',
              'mat-h-626',
            ]);
          } else if (inventorisationId) {
            this.openView(
              ViewInventorisationComponent,
              inventorisationId,
              [],
              828
            );
          } else if (ingredientId) {
            this.openView(ViewIngredientComponent, ingredientId, [
              'mat-w-688',
              'mat-h-478',
            ]);
          } else if (receiptTemplateId) {
            this.openView(ViewReceiptTemplateComponent, receiptTemplateId, [
              'mat-w-800',
              'mat-h-626',
            ]);
          } else if (entitySaleId) {
            this.openView(ViewEntitySaleComponent, entitySaleId, [
              'mat-w-800',
              'mat-h-623',
            ]);
          } else if (receiptId) {
            this.openView(ViewReceiptComponent, receiptId, [
              'mat-w-800',
              'mat-h-626',
            ]);
          } else if (productionOrderId) {
            this.openView(
              ViewProductionOrderComponent,
              productionOrderId,
              ['mat-w-960', 'mat-h-626'],
              1118
            );
          } else {
            if (!isEmpty(rest)) {
              this.currentState = {
                ...mapValues(rest, (v) => {
                  if (Array.isArray(v)) {
                    return v.map(decodeURI);
                  }
                  return decodeURI(v);
                }),
                pageIndex: rest.pageIndex ? rest.pageIndex - 1 : 0,
              };
              // console.log('bugs => base list now request rest: =>', rest);
              this.requestItems.next();
              // console.log('bugs => requestItems.next@base-list>listenQueryParams');
            } else {
              this.currentState = {};
              this.cdr.markForCheck();
            }
          }
        }
      );
  }

  private get toHttpGetItems(): OperatorFunction<void, any> {
    return switchMap(() =>
      this.httpGetItems.pipe(
        catchError(() => {
          return of({ totalCount: 0, data: [] });
        }),
        takeUntil(this.unsubscribe$)
      )
    );
  }

  protected abstract get httpGetItems(): Observable<any>;

  protected requestDeleteItems?(row?: any): Observable<any>;

  goToEdit?(row?: any): void;

  toQueryParam(key: string, value: string): void {
    console.log(11111, key, value);
    const selection = window.getSelection();
    if (!value || selection.toString().length !== 0) {
      return;
    }
    this.router.navigate([], {
      queryParams: { [key]: value },
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  }

  openRemovalDialog(row?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        // data: {
        //   title:
        //     this.deletePopupMessage ||
        //     `ნამდვილად გსურს "${
        //       (row && row[this.nameField]) || this.titlesOfSelectedItems
        //     }-ს" წაშლა?`,
        // },
        data: {
          title: this.deletePopupMessage || `ნამდვილად გსურს წაშლა?`,
          // message: this.locationService
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.deleteAndRefreshItems(row);
        }
      });
  }

  protected deleteAndRefreshItems(row?: any): void {
    this.requestDeleteItems(row)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
        this.requestItems.next();
        // console.log('bugs => requestItems.next@base-list>delteAndRefreshItems');
      });
  }

  protected openView(
    component: ComponentType<any>,
    id: string,
    panelClass: string[] = [],
    width: number = 768
  ): void {
    if (this.openedView) {
      this.openedView.close();
    }
    try {
      this.openedView = this.dialog.open(component, {
        width: width + 'px',
        data: id,
        panelClass: panelClass,
      });
      this.openedView
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((r) => {
          // console.log('dev => opened view closed => r', r);
          if (r) {
            this.requestItems.next();
          }
          if (r?.actionType) {
            console.log('dev => opened view closed => r is not boolean', r);
            this.dialogResult.next(r);
          }
          this.router.navigate([], {
            queryParamsHandling: 'merge',
            queryParams: this.emptyViewQueryParams,
            replaceUrl: true,
          });
        });
    } catch {
      this.router.navigate([], {
        queryParamsHandling: 'merge',
        queryParams: this.emptyViewQueryParams,
        replaceUrl: true,
      });
    }
  }

  onTableStateChanged(state: {
    [param: string]: string | number | Array<any>;
  }): void {
    // this.currentState = state;
    delete state.previousPageIndex;
    delete state.length;

    if (!isEqual(this.currentState, state)) {
      this.router
        .navigate([], {
          queryParams: {
            ...mapValues(state, (v) => {
              if (Array.isArray(v) && v.length) {
                return v.map(encodeURI);
              }
              const encodedValue =
                (v?.toString() && encodeURI(v as string)) || null;
              return encodedValue;
            }),
            pageIndex: +state.pageIndex + 1,
          },
          replaceUrl: true,
          queryParamsHandling: 'merge',
        })
        .then(() => {
          // console.log('bugs => requestItems.next@base-list>onTableStateChanged1');
          if (this.currentState) {
            this.requestItems.next();
          }
        });
    } else {
      // console.log('bugs => requestItems.next@base-list>onTableStateChanged2');
      this.requestItems.next();
    }
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
  }

  protected get idsOfSelectedItems(): number[] {
    return this.selectedRows
      .filter((singleItem) => singleItem)
      .map((singleItem) => singleItem.id);
  }

  get titlesOfSelectedItems(): string {
    let title = this.selectedRows.map((row) => row[this.nameField]).join(', ');

    if (title.length > 50) {
      title = `${title.slice(0, 50)}...`;
    }

    return title;
  }

  get areNoRowsSelected() {
    return this.selectedRows?.length === 0 || !this.selectedRows;
  }

  get areAllRowsSelected() {
    return this.selectedRows?.length === this.dataSource?.length;
  }

  get areMultipleRowsSelected() {
    return this.selectedRows?.length > 1;
  }

  get isOneRowSelected() {
    return this.selectedRows?.length === 1;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
