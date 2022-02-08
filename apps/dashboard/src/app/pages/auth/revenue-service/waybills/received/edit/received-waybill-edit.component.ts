import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  Inject,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterEvent,
} from '@angular/router';
import { takeUntil, map, switchMap, catchError, filter } from 'rxjs/operators';
import { Subject, Observable, of, zip, EMPTY } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { OrderStatuses } from 'apps/dashboard/src/app/core/enums/order-status.enum';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import { ColumnType, ColumnData, getUMOAcronym } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { MatDialog } from '@angular/material/dialog';
import { ReceivedWaybillEditSaveDialogComponent } from './save-dialog/received-waybill-edit-save-dialog.component';
import { ReceivedWaybillEditNewOrderComponent } from './new-order/received-waybill-edit-new-order.component';
import { ReceivedWaybillEditExistingOrderComponent } from './existing-order/received-waybill-edit-existing-order.component';
import { WaybillType } from 'apps/dashboard/src/app/core/enums/waybill-type.enum';
import { StorageService } from '@optimo/core';
import { RoutingStateService } from '@optimo/core';
import decode from 'jwt-decode';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { keyBy, mapValues } from 'lodash-es';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import * as e from 'express';

export class IWaybillRow {
  name: string;
  surname: string;
}

@Component({
  selector: 'app-received-waybill-edit',
  templateUrl: './received-waybill-edit.component.html',
  styleUrls: ['./received-waybill-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivedWaybillEditComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  public IWaybillRow = IWaybillRow;
  @ViewChild('purchaseOrdersSelector', { static: true })
  purchaseOrdersSelector: DynamicSelectComponent;

  @ViewChildren('orderLineSelector')
  orderLineSelectors: QueryList<DynamicSelectComponent>;

  waybillData: any;
  WaybillType = WaybillType;
  private purchaseOrder: any;

  mapOfunits: { [param: string]: string } = {};

  private _purchaseOrderId: number;
  set purchaseOrderId(value: number) {
    this._purchaseOrderId = value;
    this.reloadOrderLineSelectors();

    if (value) {
      this.getPurchaseOrderById(value)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((purchaseOrder) => {
          this.purchaseOrder = purchaseOrder;
        });
    }
  }

  get purchaseOrderId(): number {
    return this._purchaseOrderId;
  }

  private _supplierId: number;
  set supplierId(value: number) {
    this._supplierId = value;
    this.reloadPurchaseOrdersSelector();
    this.reloadOrderLineSelectors();
  }

  get supplierId(): number {
    return this._supplierId;
  }

  get waybillPricesFilled() {
    return this.productsDataSource.reduce((accumulator, productLine) => {
      return (
        accumulator &&
        ((productLine?.poName && productLine?.poUnitCost > 0) ||
          !productLine?.poName)
      );
    }, true);
  }

  disabled = true;
  requestIsSent: boolean;
  productsDataSource: any[] = [];
  displayedColumns: ColumnData[];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private routingState: RoutingStateService,
    private storage: StorageService,
    private bottomSheetRef: MatBottomSheetRef<ReceivedWaybillEditComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private notifier: NotificationsService
  ) {}

  ngOnInit(): void {
    const { id } = this.params;
    this.getRsUnits();
    this.getWaybillData(id);
    this.router.events
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        if (
          !(event.urlAfterRedirects as string).startsWith(
            '/rs/waybills/received/edit/'
          )
        ) {
          this.bottomSheetRef.dismiss();
        }
      });
  }

  onClose() {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || 'rs/waybills/received'
    );
  }

  showOrderLineSelector(row: any) {
    row.selectIsOpen = true;
    this.cdr.markForCheck();
  }

  hideOrderLineSelector(row: any) {
    row.selectIsOpen = false;
    this.cdr.markForCheck();
  }

  getRsUnits() {
    this.client
      .get(`waybills/units`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((units: Array<{ id: string; name: string }>) => {
        const mapOfunits = mapValues(keyBy(units, 'id'), (u) => u.name);
        this.mapOfunits = mapOfunits;
        this.displayedColumns = [
          {
            dataField: 'wbName',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.WB_NAME',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 248,
          },
          {
            dataField: 'wbQuantity',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.WB_QUANTITY',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 147,
          },
          {
            dataField: 'wbUnitId',
            columnType: ColumnType.Dropdown,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.WB_UNIT_OF_MEASUREMENT',
            filterable: false,
            sortable: false,
            data: mapOfunits,
            widthCoefficient: 122,
          },
          {
            dataField: 'wbUnitCost',
            columnType: ColumnType.Number,
            data: { type: NumberColumnType.Currency },
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.WB_UNIT_COST',
            filterable: false,
            sortable: false,
            widthCoefficient: 122,
            // editable: this.editMode !== EditModes.Receive
          },
          {
            dataField: 'wbTotalCost',
            columnType: ColumnType.Number,
            data: { type: NumberColumnType.Currency },
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.WB_TOTAL_COST',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 122,
          },

          {
            dataField: 'poName',
            columnType: ColumnType.Text,
            caption: 'GENERAL.NAME_SLASH_BARCODE',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 291,
          },
          {
            dataField: 'poQuantity',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.PO_QUANTITY',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 143,
          },
          {
            dataField: 'poUnitDescription',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.PO_UNIT_OF_MEASUREMENT',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 143.5,
          },
          {
            dataField: 'poUnitCost',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.PO_UNIT_COST',
            filterable: false,
            sortable: false,
            widthCoefficient: 143.5,
          },
          {
            dataField: 'poUnitPrice',
            columnType: ColumnType.Number,
            data: { type: NumberColumnType.Currency },
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.PO_UNIT_PRICE',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 143.5,
          },
          {
            dataField: 'poMargin',
            columnType: ColumnType.Text,
            caption:
              'WAYBILLS.RECEIVED_WAYBILLS.ITEM.DETAILS.LIST.TABLE_COLUMNS.PO_MARGIN',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 143.5,
          },
          {
            dataField: 'poTotalCost',
            columnType: ColumnType.Number,
            data: { type: NumberColumnType.Currency },
            caption: 'ჯამი',
            filterable: false,
            sortable: false,
            editable: false,
            widthCoefficient: 143.5,
          },
        ];
      });
  }

  private getWaybillData(id: string): void {
    this.client
      .get<any>('waybills', {
        params: new HttpParams({ fromObject: { number: id } }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.waybillData = data;
        this.productsDataSource = data.goods.map((item: any) => ({
          wbName: item.wName,
          wbSKU: item.barcode,
          wbQuantity: item.quantity,
          wbUnitCost: item.unitPrice,
          wbTotalCost: item.totalPrice,
          wbUnitId: item.unitId,
          wbUnitTxt: item.unitTxt,
          validation: {
            poUnitPrice: true,
            poQuantity: true,
            poSelection: true,
          },
        }));

        this.cdr.markForCheck();
        this.tryGetMatchedData();
      });
  }

  private tryGetMatchedData(): void {
    this.tryGetMatchedPurchaseOrder()
      .pipe(
        catchError(() => of(null)),
        switchMap((data) => {
          if (data) {
            return of({ isPurchaseOrder: true, ...data });
          }
          return this.tryGetMatchedSupplier();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({ isPurchaseOrder, ...data }) => {
        const accessToken = this.storage.getAccessToken();
        const tokenPayload = decode(accessToken);

        this.disabled =
          +this.waybillData.isConfirmed !== 0 && !tokenPayload.isAdmin;
        if (!data) {
          return;
        }

        if (data.supplierId) {
          this.supplierId = data.supplierId;
        }
        if (isPurchaseOrder) {
          this._purchaseOrderId = data.id;
          this.purchaseOrder = data;
          this.reloadOrderLineSelectors();
        }
        this.cdr.markForCheck();
        if (this.supplierId) {
          this.tryGetMatchedOrderLines();
        }
      });
  }

  private tryGetMatchedPurchaseOrder(): Observable<any> {
    return this.client.get<any>('purchaseorders/waybillnumber', {
      params: new HttpParams({
        fromObject: { waybillNumber: this.waybillData.waybillNumber },
      }),
    });
  }

  private tryGetMatchedSupplier(): Observable<any> {
    return this.client
      .get<any>('waybills/supplier', {
        params: new HttpParams({
          fromObject: { externalSupplierINN: this.waybillData.sellerTIN },
        }),
      })
      .pipe(map((data) => ({ isPurchaseOrder: false, ...data })));
  }

  private tryGetMatchedOrderLines(): void {
    this.client
      .post<any>('waybills/stockitem/matched', {
        supplierId: this.supplierId,
        externalStockItemBarcodes: this.waybillData.goods.map(
          (item) => item.barcode
        ),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((matchings: any[]) => {
        this.productsDataSource = this.productsDataSource.map((item) => {
          const matching = matchings.find(
            (m) => m.externalStockItemBarcode === item.wbSKU
          );
          if (matching) {
            return {
              ...item,
              stockItemId: matching.stockItemId,
              poName: matching.stockItemId,
            };
          }
          return item;
        });
        this.cdr.markForCheck();
      });
  }

  onSave(status: 'draft' | 'received'): void {
    console.log(this.productsDataSource);
    // validate inputs for positive numbers
    if (
      !this.productsDataSource.reduce((prev, curRow) => {
        const isCurValid =
          !curRow.poName || //case: item is not selected
          ((curRow.stockItemIsIngredient || //case:ingredient
            curRow?.poUnitPrice > 0) && // if not ingredient price should be more than 0
            curRow?.poQuantity > 0); // case: always
        curRow.validation.poUnitPrice = curRow?.poUnitPrice > 0; // update fake validation values
        curRow.validation.poQuantity = curRow?.poQuantity > 0; // same as ^^^
        return prev && isCurValid;
      }, true)
    ) {
      console.log('does not submit row is invald');
      this.cdr.markForCheck();
      return;
    }
    if (+this.waybillData.type === WaybillType.Return) {
      const requestBody = {
        purchaseOrderId: this.purchaseOrderId,
        waybillNumber: this.waybillData.waybillNumber,
        supplierId: this.supplierId,
        orderLines: this.productsDataSource
          .filter((item) => item.stockItemId)
          .map((item) => ({
            stockItemId: item.stockItemId,
            returnedQuantity: item.poQuantity,
            returnedUnitCost: item.poUnitCost,
          })),
      };
      this.requestIsSent = true;

      this.client
        .post<any>('purchasereturnorders/waybill', requestBody)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          () => this.onBack(),
          () => (this.requestIsSent = false) && this.cdr.markForCheck()
        );
      return;
    }
    const opener = this.purchaseOrder
      ? this.openNewOrderPopup.bind(this)
      : this.openDialogPopup.bind(this);
    opener(status);
  }

  private openDialogPopup(status: 'draft' | 'received'): void {
    this.dialog
      .open(ReceivedWaybillEditSaveDialogComponent, {
        width: '548px',
        panelClass: 'waybills-dialog',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result?: 'new' | 'existing') => {
        if (result) {
          const opener =
            result === 'new'
              ? this.openNewOrderPopup.bind(this)
              : this.openExistingOrderPopup.bind(this);
          opener(status);
        }
      });
  }

  private openNewOrderPopup(status: 'draft' | 'received'): void {
    this.dialog.open(ReceivedWaybillEditNewOrderComponent, {
      width: '548px',
      data: {
        status,
        supplierId: this.supplierId,
        waybillData: this.waybillData,
        productsDataSource: this.productsDataSource,
        purchaseOrder: this.purchaseOrder,
      },
      panelClass: ['waybills-dialog', 'top-128px'],
    });
  }

  private openExistingOrderPopup(status: 'draft' | 'received'): void {
    this.dialog
      .open(ReceivedWaybillEditExistingOrderComponent, {
        width: '768px',
        data: {
          status,
          supplierId: this.supplierId,
          waybillData: this.waybillData,
          productsDataSource: this.productsDataSource,
          purchaseOrder: this.purchaseOrder,
        },
        panelClass: 'waybills-dialog',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((backStep: boolean) => {
        if (backStep) {
          this.openDialogPopup(status);
        }
      });
  }

  onOrderLineMatch(stockItem: any, row: any): void {
    // console.log('dev => received-waybill-edit => onOrderLineMatch => matching order line');
    // console.log('dev => received-waybill-edit => onOrderLineMatch => stockItem:', stockItem);
    // console.log('dev => received-waybill-edit => onOrderLineMatch => row:', row);
    // console.log('dev => received-waybill-edit => onOrderLineMatch => purchaseOrder:', this.purchaseOrder);
    // console.log('dev => received-waybill-edit => onOrderLineMatch => dataSource:', this.productsDataSource);

    // const isAlreadyMatched = this.productsDataSource.some(wbLine => {
    //   console.log('dev => cb:isAlreadyMatched => wbLine?.poName stockItem?.id wbLine?.poName === stockItem?.id', wbLine?.poName, stockItem?.id, wbLine?.poName === stockItem?.id);
    //   console.log('dev => cb:isAlreadyMatched => wbLine?.wbSKU row?.wbSku wbLine?.wbSKU !== row?.wbSku', wbLine?.wbSKU, row?.wbSku, wbLine?.wbSKU !== row?.wbSku);
    //   return wbLine?.wbSKU !== row?.wbSKU && wbLine?.poName === stockItem?.id ;
    // });

    // if (stockItem && isAlreadyMatched) {
    //   row.poName = undefined;
    //   if (stockItem) this.notifier.sayError(`ბარკოდი - ${stockItem?.barcode} დუბლირებულია`);
    //   selector.reload();
    //   this.cdr.markForCheck();
    //   return;
    // }

    // console.log('dev => received-waybill-edit => onOrderLineMatch => isAlreadyMatched:', isAlreadyMatched);

    // if (isAlreadyMatched) {
    //   row.poNameString = stockItem?.name;
    //   row.poSKU = stockItem?.barcode;
    //   row.duplicatedStockItem = stockItem;
    //   row.validation.poSelection = false;
    //   row.poQuantity = undefined;
    //   row.poUnitCost = undefined;
    //   row.poUnitDescription = undefined;
    //   row.poUnitPrice = undefined;
    //   row.selectIsOpen = undefined;
    //   row.stockItemId = undefined;
    //   row.stockItemIsIngredient = undefined;
    //   this.cdr.markForCheck();
    //   if (stockItem) this.notifier.sayError(`ბარკოდი - ${stockItem?.barcode} დუბლირებულია`);
    //   return;
    // } else {
    //   row.validation.poSelection = true;
    //   // now check if other row got valid due to this action
    //   const selectedBarcodes = new Map<string, any[]>();
    //   this.productsDataSource.forEach(row => {
    //     if (row?.poName && row?.poSKU) {
    //       if (selectedBarcodes.has(row.poSKU.toString())) {
    //         console.log('dev => received-waybill-edit => onOrderLineMatch => pds.foreach:', 'should push');
    //         selectedBarcodes[row.poSKU.toString()].push(row)
    //       } else {
    //         console.log('dev => received-waybill-edit => onOrderLineMatch => pds.foreach:', 'should add new array');
    //         selectedBarcodes[row.poSKU.toString()] = [row];
    //       }
    //     }
    //   })
    //   console.log('dev => received-waybill-edit => onOrderLineMatch => matchedProductsMap:', selectedBarcodes);

    // }

    let orderLine: any;
    if (
      stockItem &&
      this.purchaseOrder &&
      this.purchaseOrder.orderLines &&
      this.purchaseOrder.orderLines.length
    ) {
      orderLine = this.purchaseOrder.orderLines.find(
        (item) => item.stockItemId === stockItem.id
      );
    }

    row.validation.poSelection = true;
    row.duplicatedStockItem = undefined;

    row.poQuantity = orderLine
      ? orderLine.orderedQuantity
      : stockItem && row.wbQuantity * (row.wbBoxQuantity || 1);
    row.poUnitCost = orderLine
      ? orderLine.expectedUnitCost
      : stockItem && row.wbUnitCost / (row.wbBoxQuantity || 1); //todo
    row.poSKU = orderLine
      ? orderLine.stockItemBarcode
      : stockItem && stockItem.barcode;
    row.poUnitPrice = orderLine
      ? orderLine.unitPrice
      : stockItem && stockItem.unitPrice;
    row.poInitialUnitPrice = row.poUnitPrice;
    row.poMargin = (row.poUnitPrice / row.poUnitCost) * 100 - 100;
    row.poNameString = stockItem && stockItem.name;
    row.stockItemId = stockItem && stockItem.id;
    row.lastUnitCost = stockItem && stockItem.lastUnitCost;
    row.orderLineId = orderLine && orderLine.id;
    row.stockItemIsIngredient = stockItem?.type === StockItemType.Ingredient;
    row.poUnitDescription = stockItem?.unitOfMeasurement
      ? getUMOAcronym(stockItem?.unitOfMeasurement)
      : '';
    console.log(row);
  }

  checkForDuplication(stockItemId: number, wayBillSKU: string): boolean {
    return this.productsDataSource.some(
      (wbLine) =>
        wbLine.wbSKU !== wayBillSKU &&
        (wbLine?.poName === stockItemId ||
          wbLine?.duplicatedStockItem?.id === stockItemId)
    );
  }

  checkForDeDuplications() {
    // console.log('dev => received-waybill-edit => checkForDeDuplication');
    this.productsDataSource.forEach((row) => {
      // console.log('dev => received-waybill-edit => checkForDeDuplication => now checking', row);
      if (
        row?.duplicatedStockItem &&
        !this.checkForDuplication(row?.duplicatedStockItem?.id, row?.wbSKU)
      ) {
        this.onOrderLineMatch(row.duplicatedStockItem, row);
        row.duplicatedStockItem = undefined;
      }
    });
  }

  beforeOrderLineMatch(stockItem: any, row: any) {
    if (!stockItem) return;

    if (this.checkForDuplication(stockItem?.id, row?.wbSKU)) {
      //mark as duplicate
      row.poNameString = stockItem?.name;
      row.poSKU = stockItem?.barcode;
      row.duplicatedStockItem = stockItem;
      row.validation.poSelection = false;
      row.poQuantity = undefined;
      row.poUnitCost = undefined;
      row.poUnitDescription = undefined;
      row.poUnitPrice = undefined;
      row.poInitialUnitPrice = undefined;
      row.selectIsOpen = undefined;
      row.stockItemId = undefined;
      row.stockItemIsIngredient = undefined;
      this.cdr.markForCheck();
      // notify for duplicated barcode
      if (stockItem)
        this.notifier.sayError(`ბარკოდი - ${stockItem?.barcode} დუბლირებულია`);
    } else {
      this.onOrderLineMatch(stockItem, row);
      this.checkForDeDuplications();
    }
  }

  onBoxQuantityChange(value: string, row: any) {
    console.log(
      'dev => ReceivedWaybiilEdit => boxQuantity changed: value, row',
      value,
      row
    );
    const boxQuantity = this.parseFloatWithCommas(value);
    // empty string will clear value if 0 is set
    row.wbBoxQuantity = boxQuantity || '';

    // calc quantity from box capacity and number of boxes
    row.poQuantity = row.wbQuantity * (boxQuantity || 1);

    // calc unit price based on quantity and waybill total cost
    row.poUnitCost = row.wbUnitCost / (boxQuantity || 1);
    this.cdr.markForCheck();
  }

  getSuppliers = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: `${SupplierStatuses.Enabled}`,
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get<any>('suppliers', { params });
  };

  getSupplierById = (id: number): Observable<any> => {
    return this.client.get<any>(`suppliers/${id}`);
  };

  getPurchaseOrders = (state: any): Observable<any> => {
    if (!this.supplierId) {
      return of({ totalCount: 0, data: [] });
    }
    let params = new HttpParams({
      fromObject: {
        supplierId: this.supplierId,
        sortField: 'name',
        sortOrder: 'DESC',
        ...state,
      },
    });

    if (+this.waybillData.type === WaybillType.Return) {
      params = params.append('status', OrderStatuses.Received.toString());
    } else {
      params = params
        .append('status', OrderStatuses.Ordered.toString())
        .append('status', OrderStatuses.Delayed.toString());
    }

    return this.client.get<any>('purchaseorders', { params });
  };

  getPurchaseOrderById = (id: number): Observable<any> => {
    return zip(
      this.getPurchaseOrderRequest(id),
      this.getOrderLinesRequest(id)
    ).pipe(
      catchError(() => {
        return EMPTY;
      }),
      takeUntil(this.unsubscribe$),
      map(([purchaseOrder, purchaseOrderLines]) => {
        console.log(
          'dev => getPurchaseOrderById => purchaseOrder, purchaseOrderLines:',
          purchaseOrder,
          purchaseOrderLines
        );
        purchaseOrder.orderLines = purchaseOrderLines;
        console.log(
          'dev => getPurchaseOrderById => purchaseOrder after population:',
          purchaseOrder
        );
        return purchaseOrder;
      })
    );
  };

  private getPurchaseOrderRequest(orderId: number): Observable<any> {
    return this.client.get<any>(`purchaseorders/${orderId}`);
  }

  private getOrderLinesRequest(orderId: number): Observable<any> {
    return this.client.get(`purchaseorders/orderlines/${orderId}`, {
      params: new HttpParams({
        fromObject: {
          skip: '0',
          take: '9999',
        },
      }),
      service: Service.Main,
    });
  }

  getStockitems = (state: any): Observable<any> => {
    if (!this.supplierId) {
      return of({ totalCount: 0, data: [] });
    }
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'DESC',
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client.get(`suppliers/${this.supplierId}/stockitems`, {
      params,
    });
  };

  validateAndPareseInput(curRow: any, value: any, param: string) {
    //fake validation
    if (!curRow.poName) {
      return this.parseFloatWithCommas(value);
    } else if (value <= 0) {
      curRow.validation[param] = false;
    } else {
      curRow.validation[param] = true;
    }
    this.cdr.markForCheck();
    return this.parseFloatWithCommas(value);
  }

  getStockitemById = (id: number): Observable<any> => {
    return this.client.get(`stockitems/${id}`);
  };

  parseFloatWithCommas(value: string): number {
    return Number.parseFloat(value.replace(/,/g, ''));
  }

  private reloadPurchaseOrdersSelector(): void {
    if (this.purchaseOrdersSelector) {
      this.purchaseOrdersSelector.reload();
    }
  }

  private reloadOrderLineSelectors(): void {
    this.orderLineSelectors.forEach((selector) => {
      selector.reload();
    });
  }

  onBack(): void {
    this.router.navigateByUrl(this.routingState.getPreviousUrlTree());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  rowUnitCostFell = (row: any): boolean => {
    return row.poUnitCost < row.lastUnitCost;
  };

  rowUnitCostRose = (row: any): boolean => {
    return row.poUnitCost > row.lastUnitCost;
  };

  quantityInputsDisabled = (row: any): boolean => {
    // console.log('dev => quantityInputsDisabled => row:', row);
    // console.log('dev => quantityInputsDisabled => row?.wbBoxQuantity:', row?.wbBoxQuantity);
    // console.log('dev => quantityInputsDisabled => row?.wbBoxQuantity !=="":', row?.wbBoxQuantity !== '');
    return !!row?.wbBoxQuantity && row?.wbBoxQuantity !== '';
  };

  updateUnitPriceFromMargin(row: any): void {
    // console.log('dev => updateUnitPriceFromMargin => row:', row);
    if ((row?.poMargin !== 0 && !row?.poMargin) || row?.poMargin === '') {
      row.poUnitPrice = row.poInitialUnitPrice;
      row.poMargin = (row.poUnitPrice / row.poUnitCost) * 100 - 100;
    } else {
      row.poUnitPrice = row.poUnitCost * ((100 + row.poMargin) / 100);
    }
    this.cdr.markForCheck();
  }
}
