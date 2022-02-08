import {
  measurementUnitsData,
  getUMOFullName,
} from './../../../../../core/enums/measurement-units.enum';
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
} from '@angular/core';
import { ColumnData, ColumnType, NumberColumnType } from '@optimo/ui-table';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { remove, uniqBy } from 'lodash-es';
import { tap, map } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NgModel, Validators } from '@angular/forms';
import { sumBy } from 'lodash-es';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-ingredients-list',
  templateUrl: './ingredients-list.component.html',
  styleUrls: ['./ingredients-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsListComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: NgModel;

  @ViewChildren('quantity')
  quantityInputs: QueryList<any>;

  private _orderLines: any[];

  @Input()
  set orderLines(value: any[]) {
    value =
      value &&
      value.map((item) => ({
        ...item,
        id: item.templateId
          ? `temp_${item.templateId}`
          : `stock_${item.stockItemId}`,
      }));
    this._orderLines = value;
    if (value) {
      this.selectedProductIds = value.map((o) => o.id);
    }
  }

  get orderLines(): any[] {
    return this._orderLines;
  }

  @Output()
  changeOrderLines = new EventEmitter<any[]>();

  private _selectedProductIds: any[];

  set selectedProductIds(value: any[]) {
    this._selectedProductIds = value;
    this.fillProductsDataSource();
  }

  get selectedProductIds(): any[] {
    return this._selectedProductIds;
  }

  getUMOFullName = getUMOFullName;
  private products: any[] = [];

  private tablePlaceholder = [
    // {
    //   placeholder: true,
    //   name: '—',
    //   unitOfMeasurement: '—',
    //   quantity: '—',
    //   totalCost: '—',
    // },
  ];
  productsDataSource: any[];
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: false,
      sortable: false,
      widthCoefficient: 339,
    },
    {
      dataField: 'unitOfMeasurement',
      columnType: ColumnType.Dropdown,
      caption: 'GENERAL.UNIT',
      data: measurementUnitsData,
      filterable: false,
      sortable: false,
      widthCoefficient: 170,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Text,
      caption: 'GENERAL.QUANTITY',
      filterable: false,
      sortable: false,
      widthCoefficient: 170,
    },
    {
      dataField: 'totalCost',
      columnType: ColumnType.Text,
      caption: 'GENERAL.COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
      editable: false,
      widthCoefficient: 226,
    },
  ];

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private fillProductsDataSource(): void {
    let selectedProducts =
      (this.selectedProductIds &&
        this.selectedProductIds
          .map((id) => {
            const productToAdd = this.products.find(
              (product) => product.id === id
            );

            return productToAdd;
          })
          .filter((v) => v)) ||
      [];
    if (this.orderLines) {
      const orderLines = this.orderLines.map((order) => ({
        id: order.id,
        templateId: order.templateId,
        stockItemId: order.stockItemId,
        name: order.name,
        barcode: order.stockItemBarcode,
        quantity: order.quantity,
        unitOfMeasurement: order.unitOfMeasurement,
        unitCostAVG: order.unitCostAVG,
      }));

      selectedProducts = selectedProducts.map((product) => {
        const order = orderLines.find((o) => o.id === product.id);
        if (order) {
          return { ...product, ...order };
        }
        return product;
      });
    }
    const data = selectedProducts.map((product) => {
      return (
        this.productsDataSource.find((p) => p.id === product.id) || product
      );
    });

    this.productsDataSource = data.length ? data : this.tablePlaceholder;
    this.changeOrderLines.emit(data);
  }

  onRemoveProduct(row: any): void {
    if (row.placeholder) {
      return;
    }
    remove(this.selectedProductIds, (r: any) => r === row.id);
    this.selectedProductIds = [...this.selectedProductIds];
  }

  getProducts = (state: any): Observable<any> => {
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
      .get('stockitemreceipt/items', { params })
      .pipe(this.map(), this.tap);
  };

  getProductById = (primaryKey: string): Observable<any> => {
    const [pref, id] = primaryKey.split('_');
    return this.client
      .get(
        `${pref === 'stock' ? 'stockitems' : 'stockitemreceipttemplate'}/${id}`
      )
      .pipe(this.map(primaryKey), this.tap);
  };

  private map(primaryKey?: string): MonoTypeOperatorFunction<unknown> {
    return map((res: any) => {
      const maniplate = (item) => {
        const id =
          primaryKey ||
          (item.templateId
            ? `temp_${item.templateId}`
            : `stock_${item.stockItemId}`);
        item.quantity = 1;
        return { ...item, id };
      };

      if (primaryKey) {
        return maniplate(res);
      }

      let items = res.data;
      items = items.map(maniplate);

      return { ...res, data: items };
    });
  }

  private get tap(): MonoTypeOperatorFunction<unknown> {
    return tap((res: any) => {
      const items = res.data || [res];
      if (items) {
        this.products = uniqBy([...this.products, ...items], 'id');
        this.fillProductsDataSource();
      }
    });
  }

  get ingredientsTotalPrice(): number {
    console.log(this.productsDataSource);
    return sumBy(
      this.productsDataSource,
      (product) => product.quantity * product.unitCostAVG
    );
  }

  parseFloatWithCommas(value: string): number {
    const num = Number(value) < 0 ? '1' : value;
    return Number.parseFloat(num.replace(/,/g, ''));
  }

  checkValueToZero(value: string): string {
    return Number(value) === 0 ? '1' : value;
  }

  public markFormGroupTouched(): void {
    this.quantityInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    if (!this.selectedProductIds || !this.selectedProductIds.length) {
      this.dynamicSelector.control.setValidators(Validators.required);
      this.dynamicSelector.control.markAsTouched();
      this.dynamicSelector.control.updateValueAndValidity();
    }
    this.cdr.markForCheck();
  }
}
