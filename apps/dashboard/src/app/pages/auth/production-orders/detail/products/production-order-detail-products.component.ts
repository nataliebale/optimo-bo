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
import { tap } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NgModel, Validators } from '@angular/forms';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-production-order-detail-products',
  templateUrl: './production-order-detail-products.component.html',
  styleUrls: ['./production-order-detail-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionOrderDetailProductsComponent {
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
      this.selectedProductIds = value.map((o) => o.stockItemReceiptId);
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

  private products: any[] = [];

  private tablePlaceholder = [
    // {
    //   placeholder: true,
    //   name: '—',
    //   barcode: '—',
    //   unitCost: '—',
    //   unitPrice: '—',
    //   quantity: '—',
    //   isApproved: '—',
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
      editable: false,
      widthCoefficient: 1.8,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'GENERAL.COST',
      data: { type: NumberColumnType.Decimal, prefix: '₾', digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Text,
      caption: 'GENERAL.UNIT_PRICE',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Text,
      caption: 'GENERAL.QUANTITY',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: 0.35,
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
            return (
              productToAdd && {
                stockItemReceiptId: productToAdd.id,
                name: productToAdd.name,
                barcode: productToAdd.barcode,
                unitCost: productToAdd.unitCost,
                unitPrice: productToAdd.unitPrice,
                quantity: '',
                isApproved: true,
                totalPrice: '',
              }
            );
          })
          .filter((v) => v)) ||
      [];

    if (this.orderLines) {
      const orderLines = this.orderLines.map((order) => ({
        stockItemReceiptId: order.stockItemReceiptId,
        name: order.stockItemName,
        quantity: order.quantity,
        unitCost: order.unitCost,
        unitPrice: order.unitPrice,
        isApproved: order.isApproved,
      }));

      selectedProducts = selectedProducts.map((product) => {
        const order = orderLines.find(
          (o) => o.stockItemReceiptId === product.stockItemReceiptId
        );
        if (order) {
          return { ...product, ...order, unitCost: product.unitCost };
        }
        return product;
      });
    }
    const data = selectedProducts.map((product) => {
      return (
        this.productsDataSource.find(
          (p) => p.stockItemReceiptId === product.stockItemReceiptId
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
    remove(this.selectedProductIds, (r: any) => r === row.stockItemReceiptId);
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

    return this.client.get('stockitemreceipt', { params }).pipe(this.tap);
  };

  getProductById = (id: number): Observable<any> => {
    return this.client.get(`stockitemreceipt/${id}`).pipe(this.tap);
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
    this.quantityInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    this.unitPriceInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    if (!this.selectedProductIds || !this.selectedProductIds.length) {
      this.dynamicSelector.control.markAsTouched();
      this.dynamicSelector.control.setValidators(Validators.required);
      this.dynamicSelector.control.updateValueAndValidity();
    }
    this.cdr.markForCheck();
  }

  hash(text: string): number {
    let hash = 0;
    let chr: number;
    if (text.length === 0) {
      return hash;
    }
    for (let i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      // tslint:disable-next-line: no-bitwise
      hash = (hash << 5) - hash + chr;
      // tslint:disable-next-line: no-bitwise
      hash |= 0;
    }
    return hash;
  }
}
