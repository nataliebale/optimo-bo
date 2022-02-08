import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  ViewChildren,
  QueryList,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { MonoTypeOperatorFunction, Observable, Subject, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { remove, uniqBy } from 'lodash-es';
import { tap, takeUntil } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NgModel, Validators } from '@angular/forms';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import { PricesChangeCriteria } from 'apps/dashboard/src/app/core/enums/prices-change-criteria.enum';
import { formatRFC3339 } from 'date-fns';
import { PricesChangeType } from 'apps/dashboard/src/app/core/enums/prices-change-type.enum';
import { sumBy } from 'lodash-es';
import { formatDate } from '@angular/common';
import { NumberColumnType } from '@optimo/ui-table';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
const insert = (arr: any[], i: number, newItems: any[]) => [
  ...arr.slice(0, i),
  ...newItems,
  ...arr.slice(i),
];

export enum PriceChangeType {
  Static = 'Static',
  Percent = 'Percent',
}

@Component({
  selector: 'app-prices-change-list',
  templateUrl: './prices-change-list.component.html',
  styleUrls: ['./prices-change-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricesChangeListComponent implements OnDestroy {
public textIsTruncated = textIsTruncated;
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: DynamicSelectComponent;

  @ViewChild('dynamicSelectorModel', { static: true })
  dynamicSelectorModel: NgModel;

  @ViewChildren('changeRate')
  changeRateInputs: QueryList<any>;

  @Input()
  type: PricesChangeType;

  private _criteria: PricesChangeCriteria;
  @Input()
  set criteria(value: PricesChangeCriteria) {
    this._criteria = value;
    this.reset();
  }

  get criteria(): PricesChangeCriteria {
    return this._criteria;
  }

  private _dateFrom: Date;
  @Input()
  set dateFrom(value: Date) {
    this._dateFrom = value;
    this.reset();
  }

  get dateFrom(): Date {
    return this._dateFrom;
  }

  private _dateTo: Date;
  @Input()
  set dateTo(value: Date) {
    this._dateTo = value;
    this.reset();
  }

  get dateTo(): Date {
    return this._dateTo;
  }

  @Output()
  changeValues = new EventEmitter<any>();

  private _selectedProductIds: any[];

  set selectedProductIds(value: any[]) {
    if (!Array.isArray(value)) {
      value = [value];
    }
    this._selectedProductIds = value;
    if (this.criteria === PricesChangeCriteria.StockItem) {
      return;
    }
    this.fillProductsDataSource();
  }

  get selectedProductIds(): any[] {
    return this._selectedProductIds;
  }

  private _productsDataSource: any[];

  set productsDataSource(value: any[]) {
    this._productsDataSource = value;
    this.emitChangeValues();
  }

  get productsDataSource(): any[] {
    return this._productsDataSource;
  }

  displayedColumns: ColumnData[] = [
    {
      dataField: '__expand',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: null,
    },
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'changeRate',
      columnType: ColumnType.Text,
      caption: 'ცვლილება',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'cost',
      columnType: ColumnType.Number,
      caption: 'შეს. ფასი',
      data: {
        type: NumberColumnType.Decimal,
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'price',
      columnType: ColumnType.Number,
      caption: 'გას. ფასი',
      data: {
        type: NumberColumnType.Decimal,
        digitsAfterDot: 4,
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'changedPrice',
      columnType: ColumnType.Number,
      caption: 'საბ. ფასი',
      data: {
        type: NumberColumnType.Decimal,
        digitsAfterDot: 4,
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
  ];
  PricesChangeCriteria = PricesChangeCriteria;
  PricesChangeType = PricesChangeType;
  focusedId?: number;
  // customPatterns = {
  //   '0': { pattern: new RegExp('-|[0-9]'), optional: true },
  //   '9': { pattern: new RegExp('[0-9]') }
  // };

  private products: any[] = [];

  private tablePlaceholder = [
    {
      placeholder: true,
      name: '—',
      changeRate: '—',
      cost: '—',
      price: '—',
      changedPrice: '—',
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  onStockItemAdd(stockItem: any): void {
    if (this.productsDataSource.length <= 1) {
      this.productsDataSource = [
        {
          id: -1,
          name: 'პროდუქტები',
          changeRate: '',
          cost: '',
          price: '',
          changedPrice: '',
          __expanded: true,
          children: [],
          priceChangeType: PriceChangeType.Percent,
        },
      ];
    }

    let params = new HttpParams({
      fromObject: {
        stockItemId: stockItem.id,
        validFrom: formatRFC3339(this.dateFrom),
      },
    });

    if (this.dateTo) {
      params = params.append('validTo', formatRFC3339(this.dateTo));
    }

    this.getStockItemsForPriceChange(params).subscribe(([item]) => {
      const parent = this.productsDataSource[0];
      this.productsDataSource = [
        ...this.productsDataSource,
        {
          id: item.id,
          name: item.name,
          cost: item.unitCost,
          price: item.unitPrice,
          changeRate: parent.changeRate,
          changedPrice: this.calculateChangedPrice(
            item.unitPrice,
            parent.changeRate,
            parent.priceChangeType
          ),
          prices: item.prices,
          __parentId: -1,
          __totalCost: item.totalCost,
          __totalPrice: item.totalPrice,
          priceChangeType: parent.priceChangeType,
          barcode: item.barcode,
        },
      ];
      parent.cost = +parent.cost + item.totalCost;
      parent.price = +parent.price + item.totalPrice;
      parent.changedPrice = this.calculateChangedPrice(
        parent.price,
        parent.changeRate,
        parent.priceChangeType
      );
      // TODO: remove console.log
      console.log('new data source is:', this.productsDataSource);
      this.cdr.markForCheck();
    });
  }

  onStockItemRemove({ value }): void {
    remove(this.productsDataSource, (item) => item.id === value.id);
    if (this.productsDataSource.length <= 1) {
      this.productsDataSource = this.tablePlaceholder;
    } else {
      const [parent, ...children] = this.productsDataSource;
      parent.cost = sumBy(children, (child) => child.__totalCost);
      parent.price = sumBy(children, (child) => child.__totalPrice);
      parent.changedPrice = this.calculateChangedPrice(
        parent.price,
        parent.changeRate,
        parent.priceChangeType
      );
      this.productsDataSource = [...this.productsDataSource];
    }
  }

  private fillProductsDataSource(): void {
    if (this.criteria === PricesChangeCriteria.StockItem) {
      return;
    }
    const expandeds = [];
    let selectedProducts =
      (this.selectedProductIds &&
        this.selectedProductIds
          .map((id, index) => {
            const productToAdd = this.products.find(
              (product) => product.id === id
            );

            const old = this.productsDataSource.find((i) => {
              return i.id === id;
            });

            if (old && old.__expanded) {
              expandeds.push({ id, index });
            }

            return (
              productToAdd && {
                id: productToAdd.id,
                name: productToAdd.name,
                changeRate: (old && old.changeRate.toString()) || '',
                cost: productToAdd.totalCost,
                price: productToAdd.totalPrice,
                changedPrice: productToAdd.totalPrice,
                __expanded: old && old.__expanded,
                children: [],
                priceChangeType: PriceChangeType.Percent,
                totalQuantityOnHand: productToAdd.totalQuantityOnHand,
              }
            );
          })
          .filter((v) => v)) ||
      [];

    expandeds.forEach(({ id, index }) => {
      const children = this.productsDataSource.filter(
        (item) => item.__parentId === id
      );

      selectedProducts = insert(selectedProducts, index + 1, children);
    });

    this.productsDataSource = selectedProducts.length
      ? selectedProducts
      : this.tablePlaceholder;
  }

  onRowExpansionToggle({ index, row }): void {
    if (row.__expanded) {
      row.__expanded = false;
      this.productsDataSource.splice(index + 1, row.children.length);
      this.productsDataSource = [...this.productsDataSource];
    } else {
      row.__expanded = true;

      let params = new HttpParams({
        fromObject: {
          validFrom: formatRFC3339(this.dateFrom),
        },
      }).append(
        this.criteria === PricesChangeCriteria.Category
          ? 'categoryId'
          : 'supplierId',
        this.selectedProductIds[0]
      );

      if (this.dateTo) {
        params = params.append('validTo', formatRFC3339(this.dateTo));
      }

      this.getStockItemsForPriceChange(params).subscribe((children) => {
        row.children = children.map((item) => ({
          id: item.id,
          name: item.name,
          cost: item.unitCost,
          price: item.unitPrice,
          changeRate: row.changeRate,
          changedPrice: this.calculateChangedPrice(
            item.unitPrice,
            row.changeRate,
            row.priceChangeType
          ),
          prices: item.prices,
          barcode: item.barcode,
          priceChangeType: row.priceChangeType,
        }));
        this.productsDataSource = insert(
          this.productsDataSource,
          index + 1,
          row.children.map((item) => ({
            ...item,
            __parentId: row.id,
          }))
        );
        this.cdr.markForCheck();
      });
    }
  }

  onChangeRateChange(value: any, row: any): void {
    value = this.parseFloatWithCommas(value);
    row.changeRate = value;
    row.changedPrice = this.calculateChangedPrice(
      row.price,
      value,
      row.priceChangeType,
      row.totalQuantityOnHand ? row.totalQuantityOnHand : 1
    );
    if (row.children) {
      this.productsDataSource.forEach((item) => {
        if (item.__parentId === row.id) {
          if (item.priceChangeType === row.priceChangeType) {
            item.changeRate = value;
            item.changedPrice = this.calculateChangedPrice(
              item.price,
              value,
              item.priceChangeType
            );
          }
        }
      });
      row.children.forEach((item) => {
        item.changeRate = value;
        item.changedPrice = this.calculateChangedPrice(
          item.price,
          value,
          item.priceChangeType
        );
      });
    }
    this.emitChangeValues();
  }

  onRemoveProduct(row: any): void {
    if (row.placeholder) {
      return;
    }

    if (this.criteria === PricesChangeCriteria.StockItem) {
      if (row.id === -1) {
        this.reset();
        return;
      }

      this.onStockItemRemove({ value: row });
      remove(this._selectedProductIds, (r: any) => r === row.id);
      this._selectedProductIds = [...this._selectedProductIds];
      return;
    }

    if (row.__parentId) {
      remove(
        this.productsDataSource,
        (item) => item.id === row.id && item.__parentId === row.__parentId
      );
      this.productsDataSource = [...this.productsDataSource];
    } else {
      remove(this.selectedProductIds, (r: any) => r === row.id);
      this.selectedProductIds = [...this.selectedProductIds];
    }
  }

  private emitChangeValues(): void {
    const [parent, ...children] = this.productsDataSource;
    if (!this.productsDataSource.length || parent.placeholder) {
      this.changeValues.emit(null);
      return;
    }

    if (this.productsDataSource.length >= 2) {
      this.changeValues.emit(
        children.map((child) => ({
          id: child.id,
          priceChangeType: child.priceChangeType,
          quantity: child.changeRate,
        }))
      );
      return;
    }

    this.changeValues.emit({
      id: parent.id,
      priceChangeType: parent.priceChangeType,
      quantity: parent.changeRate,
    });
  }

  getProducts = (state: any): Observable<any> => {
    console.log(state);
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
        withTypeFlag: (
          StockItemType.Manufactured + StockItemType.Product
        ).toString(),
      },
    });
    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client
      .get<any>(this.endpoint, { params })
      .pipe(this.tap);
  };

  getProductById = (id: number): Observable<any> => {
    if (typeof id !== 'number') {
      return of();
    }
    return this.client.get<any>(`${this.endpoint}/${id}`).pipe(this.tap);
  };

  private get tap(): MonoTypeOperatorFunction<unknown> {
    return tap((items: any) => {
      items = items.data || [items];
      if (items && this.criteria !== PricesChangeCriteria.StockItem) {
        this.products = uniqBy([...this.products, ...items], 'id');
        this.fillProductsDataSource();
      }
    });
  }

  private reset(): void {
    this.productsDataSource = this.tablePlaceholder;
    this.products = [];
    this.selectedProductIds = [];
    this.dynamicSelector.reload();
    this.cdr.markForCheck();
  }

  public markFormGroupTouched(): void {
    if (!this.selectedProductIds || !this.selectedProductIds.length) {
      this.dynamicSelectorModel.control.setValidators(Validators.required);
      this.dynamicSelectorModel.control.markAllAsTouched();
      this.dynamicSelectorModel.control.updateValueAndValidity();
    }
    this.changeRateInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    this.cdr.markForCheck();
  }

  private get endpoint(): string {
    switch (this.criteria) {
      case PricesChangeCriteria.Category: {
        return 'stockitemcategories';
      }
      case PricesChangeCriteria.Supplier: {
        return 'suppliers';
      }
      case PricesChangeCriteria.StockItem: {
        return 'stockitems';
      }
    }
  }

  get selectorPlaceholder(): string {
    switch (this.criteria) {
      case PricesChangeCriteria.Category:
        return 'აირჩიე კატეგორია';
      case PricesChangeCriteria.StockItem:
        return 'აირჩიე პროდუქტი';
      case PricesChangeCriteria.Supplier:
        return 'აირჩიე მომწოდებლი';
    }
  }

  getConflictedChangeDates(prices: any[]): string {
    return prices
      .map((p) => formatDate(p.validFrom, 'd MMM yy', this.locale))
      .join('\n');
  }

  parseFloatWithCommas(value: string): number {
    return Number.parseFloat(value.replace(/,/g, ''));
  }

  onFocus(id?: number): void {
    this.focusedId = id;
  }

  private calculateChangedPrice(
    currentPrice: number,
    changeRate: number,
    priceChangeType: PriceChangeType,
    numberOfItems: number = 1
  ): number {
    return priceChangeType === PriceChangeType.Percent
      ? currentPrice + (currentPrice * changeRate) / 100
      : priceChangeType === PriceChangeType.Static
      ? currentPrice + changeRate * numberOfItems
      : currentPrice; // not possible price should be Static|Percent
  }

  private getStockItemsForPriceChange(params: HttpParams): Observable<any> {
    return this.client
      .get<any>('stockitems/getstockitemsforpricechange', { params })
      .pipe(takeUntil(this.unsubscribe$));
  }

  onTogglePriceChangeType(row: any): void {
    console.log('price change type changed', row);
    row.changeRate = '';
    row.priceChangeType =
      row?.priceChangeType === 'Static'
        ? (row.priceChangeType = 'Percent')
        : (row.priceChangeType = 'Static');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
