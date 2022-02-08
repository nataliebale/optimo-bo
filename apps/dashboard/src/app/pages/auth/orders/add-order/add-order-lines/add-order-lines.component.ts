import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import { MonoTypeOperatorFunction, Observable, of, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { sumBy } from 'lodash-es';
import { skip, takeUntil, tap } from 'rxjs/operators';
import { EditModes } from '../../../../../core/enums/edit-modes.enum';
import { StockItemStatuses } from '../../../../../core/enums/stockitem-status.enum';
import {
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgModel,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NumberColumnType } from '@optimo/ui-table';
import { getUMOAcronym } from '../../../../../core/enums/measurement-units.enum';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';

export interface IOrderLine {
  stockItemId: number;
  orderedQuantity: number;
  expectedUnitCost: number;
  unitPrice?: number;
}

@Component({
  selector: 'app-add-order-lines',
  templateUrl: './add-order-lines.component.html',
  styleUrls: ['./add-order-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
})
export class AddOrderLinesComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject<void>();

  getUMOAcronym = getUMOAcronym;
  textIsTruncated = textIsTruncated;
  stockitemType = StockItemType;
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: NgModel;

  @ViewChild(DynamicSelectComponent, { static: true })
  supplierProductsSelector: DynamicSelectComponent;

  @ViewChildren('unitCost')
  unitCostInputs: QueryList<any>;

  @ViewChildren('unitPrice')
  unitPriceInputs: QueryList<any>;

  @ViewChildren('orderedQuantity')
  orderedQuantityInputs: QueryList<any>;

  private _supplierId: number;

  @Input()
  set supplierId(value: number) {
    this._supplierId = value;

    this.selectedProductIds = [];
    this.reloadDynamicSelector();
  }

  get supplierId(): number {
    return this._supplierId;
  }

  @Input()
  orderLines: any[];

  @Input()
  editable: boolean;

  @Input()
  withUnitPrice: boolean;

  @Input()
  clearSelection: EventEmitter<void>;

  @Output()
  changeOrderLines = new EventEmitter<any[]>();

  private _selectedProductIds: any[];

  set selectedProductIds(value: any[]) {
    this._selectedProductIds = value;
    // TODO:  this.fillProductsDataSource();
  }

  get selectedProductIds(): any[] {
    return this._selectedProductIds;
  }

  private supplierProducts: any[] = [];

  editModes = EditModes;
  private tablePlaceholder = [];

  _productsDataSource: any[];
  get productsDataSource(): any[] {
    return this._productsDataSource || [];
  }
  set productsDataSource(data: any[]) {
    this._productsDataSource = data;
  }
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.TITLE',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.7,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
      },
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Text,
      caption: 'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.UNIT_COST',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'orderedQuantity',
      columnType: ColumnType.Text,
      caption:
        'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.ORDERED_QUANTITY',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'totalCost',
      columnType: ColumnType.Text,
      caption: 'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.TOTAL_COST',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: 0.4,
    },
  ];

  unitPriceCol: ColumnData = {
    dataField: 'unitPrice',
    columnType: ColumnType.Text,
    caption: 'ORDERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.UNIT_PRICE',
    filterable: false,
    sortable: false,
  };

  // instance variables for form control
  onChange: (orderLines: IOrderLine[]) => void;
  onTouched: () => void;
  disabled: boolean;

  orderLinesArray: FormArray;

  stockItemsCache: Map<number, any> = new Map();

  selectControl: FormControl;

  formGroupsCache: Map<number, FormGroup> = new Map();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private parent: FormGroupDirective
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    if (this.withUnitPrice) {
      this.displayedColumns.splice(5, 0, this.unitPriceCol);
    }
    this.selectControl = new FormControl([], [this.requiredNotEmpty]);
    if (!this?.parent?.form?.controls?.orderLines)
      console.error('parent for does not contain orderLines control');
    this.orderLinesArray = <FormArray>this.parent.form.controls.orderLines;
    this.selectControl.setValue(
      this.orderLines?.map((orderLine) => orderLine.stockItemId)
    );
    this.initDataSource(this.orderLines);
    // this.selectControl.setValue([]);
    // this.initDataSource([]);

    this.clearSelection
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => {
        if (this.selectControl?.value?.length > 0) {
          this.selectControl.setValue([]);
          this.orderLinesArray.clear();
          this.cdr.markForCheck();
        }
      });
  }

  initDataSource(orderLines: any[]) {
    console.log(
      'dev => AddOrderLinesComponent => initDataSource => orderLines:',
      orderLines
    );
    // if orderLines are provided preFillTable with selected values
    if (orderLines?.length) {
      this.productsDataSource = orderLines.map((orderLine) => ({
        stockItemId: orderLine.stockItemId,
        stockItemName: orderLine.stockItemName,
        stockItemBarcode: orderLine.stockItemBarcode,
        stockItemQuantity: orderLine.quantityAvailable,
        unitOfMeasurement: orderLine.unitOfMeasurement,
        orderedQuantity: orderLine.orderedQuantity,
        expectedUnitCost: orderLine.expectedUnitCost,
        unitPrice: orderLine.unitPrice,
        controlGroup: this.getControlGroup(orderLine.stockItemId, {
          orderLineId: orderLine.id,
          unitCost: orderLine.expectedUnitCost,
          orderedQuantity: orderLine.orderedQuantity,
          unitPrice: orderLine.unitPrice,
        }),
      }));
      this.cdr.markForCheck();
      console.log(
        'dev => AddOrderLinesComponent => updateDataSource => productsDataSource:',
        this.productsDataSource
      );
    }
    this.rebuildFormArray();
  }

  private getControlGroup(
    stockItemId: number,
    orderLineData: {
      orderLineId?: number;
      unitCost?: number;
      orderedQuantity?: number;
      unitPrice?: number;
    }
  ): FormGroup {
    console.log('dev => getControlGroup => stockItemId:', stockItemId);
    if (!this.formGroupsCache.has(stockItemId)) {
      this.formGroupsCache.set(
        stockItemId,
        new FormGroup({
          orderLineId: new FormControl(orderLineData.orderLineId),
          stockItemId: new FormControl(stockItemId),
          unitCost: new FormControl(orderLineData.unitCost, [
            Validators.required,
            this.floatMoreThanZero,
          ]),
          orderedQuantity: new FormControl(orderLineData.orderedQuantity, [
            Validators.required,
            this.floatMoreThanZero,
          ]),
          unitPrice: new FormControl(orderLineData.unitPrice, [
            Validators.required,
            ...(orderLineData.unitPrice !== 0 ? [this.floatMoreThanZero] : []),
          ]),
        })
      );
    }
    return this.formGroupsCache.get(stockItemId);
  }

  onSelectChange(selectedStockItems: any) {
    console.log(
      'dev => AddOrderLinesComponent => onSelectChange => selectedStockItems:',
      selectedStockItems
    );
    if (!selectedStockItems) return;
    if (!selectedStockItems.map) return; // this is to prevent DOM EVENT

    // rebuild data source
    this.productsDataSource = selectedStockItems.map((stockItem) => {
      return {
        stockItemId: stockItem.id,
        stockItemName: stockItem.name,
        stockItemBarcode: stockItem.barcode,
        stockItemQuantity: stockItem.quantity,
        unitOfMeasurement: stockItem.unitOfMeasurement,
        expectedUnitCost: stockItem.lastUnitCost,
        unitPrice: stockItem.unitPrice,
        controlGroup: this.getControlGroup(stockItem.id, {
          unitCost: stockItem.lastUnitCost,
          unitPrice: stockItem.unitPrice,
        }), // get cached control so that value is not lost
      };
    });
    // clear formArray and rebuild
    this.rebuildFormArray();
    this.cdr.markForCheck();
  }

  private rebuildFormArray(): void {
    this.orderLinesArray.clear();
    this.productsDataSource.forEach((orderLine) => {
      this.orderLinesArray.push(orderLine.controlGroup);
    });
  }

  onRemove(stockItemId: number) {
    const newSelection = this.selectControl.value?.filter(
      (val) => val !== stockItemId
    );
    this.selectControl.setValue(newSelection);
  }

  cacheStockItems(stockItems: any[]) {
    stockItems?.forEach((item) => {
      if (!this.stockItemsCache.has(item.id)) {
        this.stockItemsCache.set(item.id, item);
      }
    });
    console.log(
      'dev => AddOrderLinesComponent => cacheStockItems => Map:',
      this.stockItemsCache
    );
  }

  getOrderLineTotalCost(row: any): number {
    if (row?.controlGroup) {
      return (
        Number.parseFloat(row.controlGroup.controls.unitCost.value) *
          Number.parseFloat(row.controlGroup.controls.orderedQuantity.value) ||
        0
      );
    }
    return 0;
  }

  get totalUnitCost(): number {
    // console.log('dev => totalUnitCost', this.productsDataSource.map(line => line.controlGroup.controls.unitCost.value));
    return sumBy(
      this.productsDataSource,
      (orderLine) =>
        Number.parseFloat(orderLine.controlGroup.controls.unitCost.value) *
          Number.parseFloat(
            orderLine.controlGroup.controls.orderedQuantity.value
          ) || 0
    );
  }

  private reloadDynamicSelector(): void {
    if (this.supplierProductsSelector) {
      this.supplierProductsSelector.reload();
    }
  }

  getSupplierProducts = (state: any): Observable<any> => {
    if (!this.supplierId) {
      return of({ totalCount: 0, data: [] });
    }
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
      },
    });
    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client
      .get(`suppliers/${this.supplierId}/stockitems`, { params })
      .pipe(this.tap);
  };

  getProductById = (id: number): Observable<any> => {
    if (typeof id !== 'number') {
      return of();
    }
    return this.client.get(`stockitems/${id}`).pipe(this.tap);
  };

  private get tap(): MonoTypeOperatorFunction<unknown> {
    return tap((items: any) => {
      // console.log('dev => tapping => items:', items);
      if (items?.data?.length) {
        this.cacheStockItems(items.data);
      }
    });
  }

  parseFloatWithCommas(value: string): number {
    return Number.parseFloat(value.replace(/,/g, ''));
  }

  parseFloatWithCommasForUnitPrice(value: string): number {
    // TO DO:: I'm in a rush // it needs to be changed
    this.unitPriceInputs.forEach((con: NgModel) => {
      if (con.value === '0') {
        con.control.setValue('');
      }
    });
    return value === '0' ? NaN : Number.parseFloat(value.replace(/,/g, ''));
  }

  validateAndPareseInput(curRow: any, value: any, param: string) {
    //fake validation
    if (value <= 0) {
      curRow.validation[param] = false;
    } else {
      curRow.validation[param] = true;
    }
    this.cdr.markForCheck();
    return this.parseFloatWithCommas(value);
  }

  public markFormGroupTouched(): void {
    console.log('dev => AddOrderLines => markFormGroupTouched');
    this.selectControl.markAsTouched();
    this.orderLinesArray.markAllAsTouched();
    this.cdr.markForCheck();
    // this.unitCostInputs.forEach((model: NgModel) => {
    //   model.control.markAllAsTouched();
    // });
    // this.orderedQuantityInputs.forEach((model: NgModel) => {
    //   model.control.markAllAsTouched();
    // });
    // if (!this.selectedProductIds || !this.selectedProductIds.length) {
    //   this.dynamicSelector.control.setValidators(Validators.required);
    //   this.dynamicSelector.control.updateValueAndValidity();
    // }
    // this.cdr.markForCheck();
  }

  requiredNotEmpty = (control: FormControl): ValidationErrors => {
    console.log('dev => requiredNotEmpty => validate value', control.value);
    const errors =
      !control?.value || control?.value?.length === 0
        ? {
            arrayIsEmpty: true,
          }
        : null;
    // console.log('dev => requiredNotEmpty => errors', errors);
    return errors;
  };

  floatMoreThanZero = (control: FormControl): ValidationErrors => {
    console.log('dev => floatMoreThanZero => validate value', control.value);
    return !control?.value || control?.value <= 0
      ? { valueNotMoreThan0: true }
      : null;
  };
}
