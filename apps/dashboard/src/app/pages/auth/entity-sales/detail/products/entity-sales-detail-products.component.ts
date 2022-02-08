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
import { remove, sumBy, uniqBy } from 'lodash-es';
import { tap } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NgModel, Validators } from '@angular/forms';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-entity-sales-detail-products',
  templateUrl: './entity-sales-detail-products.component.html',
  styleUrls: ['./entity-sales-detail-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitySalesDetailProductsComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: NgModel;

  @ViewChildren('unitPrice')
  unitPriceInputs: QueryList<any>;

  @ViewChildren('quantity')
  quantityInputs: QueryList<any>;

  private _orderLines: any[];

  @Input()
  set orderLines(value: any[]) {
    this._orderLines = value;
    if (value) {
      this.selectedProductIds = value.map((o) => o.stockItemId);
    }
  }

  @Input()
  public hasTaxRate: boolean;

  @Input()
  public taxAmount: number;

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

  private products: any[] = [];

  private tablePlaceholder = [
    // {
    //   placeholder: true,
    //   name: '—',
    //   quantityOnHand: '—',
    //   unitPrice: '—',
    //   quantity: '—',
    //   totalPrice: '—',
    // },
  ];
  productsDataSource: any[];
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      editable: false,
      widthCoefficient: 1.8,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      caption: 'მარაგი',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      editable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'გას. ფასი',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'რაოდენობა',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalPrice',
      columnType: ColumnType.Number,
      caption: 'ღირებულება',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
      editable: false,
      widthCoefficient: 1.4,
    },
  ];

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  get totalUnitPrice(): number {
    return sumBy(
      this.productsDataSource,
      (product) => product.unitPrice * product.quantity
    );
  }

  get getTaxAmount(): number {
    return (this.totalUnitPrice / 100) * this.taxAmount;
  }

  private fillProductsDataSource(): void {
    // todo
    let selectedProducts =
      (this.selectedProductIds &&
        this.selectedProductIds
          .map((id) => {
            const productToAdd = this.products.find(
              (product) => product.id === id
            );
            return (
              productToAdd && {
                stockItemId: productToAdd.id,
                name: productToAdd.name,
                barcode: productToAdd.barcode,
                quantityOnHand: productToAdd.quantity,
                unitPrice: productToAdd.unitPrice,
                quantity: '',
                totalPrice: '',
              }
            );
          })
          .filter((v) => v)) ||
      [];
    console.log('TCL: AddOrderComponent -> selectedProducts', selectedProducts);

    if (this.orderLines) {
      const orderLines = this.orderLines.map((order) => ({
        stockItemId: order.stockItemId,
        name: order.stockItemName,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
      }));

      selectedProducts = selectedProducts.map((product) => {
        const order = orderLines.find(
          (o) => o.stockItemId === product.stockItemId
        );
        if (order) {
          return { ...product, ...order };
        }
        return product;
      });
    }
    const data = selectedProducts.map((product) => {
      return (
        this.productsDataSource.find(
          (p) => p.stockItemId === product.stockItemId
        ) || product
      );
    });

    this.productsDataSource = data.length ? data : this.tablePlaceholder;
    this.changeOrderLines.emit(data);
  }

  onRemoveProduct(row: any): void {
    if (row.placeholder) {
      return;
    }
    remove(this.selectedProductIds, (r: any) => r === row.stockItemId);
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
        withTypeFlag: StockItemType.Product.toString(),
      },
    });
    if (state.searchValue) {
      params = params.append('barcodeorname', state.searchValue);
    }

    return this.client.get('stockitems', { params }).pipe(this.tap);
  };

  getProductById = (id: number): Observable<any> => {
    return this.client.get(`stockitems/${id}`).pipe(this.tap);
  };

  private get tap(): MonoTypeOperatorFunction<unknown> {
    return tap((items: any) => {
      items = items.data || [items];
      if (items) {
        this.products = uniqBy([...this.products, ...items], 'id');
        this.fillProductsDataSource();
      }
    });
  }

  parseFloatWithCommas(value: string): number {
    return Number.parseFloat(value.replace(/,/g, ''));
  }

  public markFormGroupTouched(): void {
    this.unitPriceInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
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
