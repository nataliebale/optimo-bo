import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { ColumnType, ColumnData, NumberColumnType } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { uniqBy, remove } from 'lodash-es';
import { Observable, MonoTypeOperatorFunction, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { tap, takeUntil } from 'rxjs/operators';
import { StockItemType } from '../../../../../core/enums/stockitem-type.enum';
import { StockItemStatuses } from '../../../../../core/enums/stockitem-status.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-add-supplier-stockitems',
  templateUrl: './add-supplier-stockitems.component.html',
  styleUrls: ['./add-supplier-stockitems.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSupplierStockitemsComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  @Input()
  editId: number;

  @Output()
  changeSupplierProducts = new EventEmitter<any[]>();

  private _selectedProductIds: any[];

  set selectedProductIds(value: any[]) {
    this._selectedProductIds = value;
    this.fillProductsDataSource();
  }

  get selectedProductIds(): any[] {
    return this._selectedProductIds;
  }

  private stockitems: any[] = [];
  private tablePlaceholder = [
    // { placeholder: true, name: '—', categoryName: '—', unitCost: '—' },
  ];
  productsDataSource: any[];
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.TITLE',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.CATEGORY',
      filterable: false,
      sortable: false,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'SUPPLIERS.ITEM.DETAILS.STOCKITEMS_LIST.TABLE_COLUMNS.UNIT_COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
  ];
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService) {}

  ngOnInit(): void {
    if (this.editId) {
      const params = new HttpParams({
        fromObject: {
          sortField: 'name',
          sortOrder: 'ASC',
          pageIndex: '0',
          status: [StockItemStatuses.Enabled.toString(), StockItemStatuses.Disabled.toString()],
          pageSize: '10000',
        },
      });

      this.client
        .get(`suppliers/${this.editId}/stockitems`, { params })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(({ data }) => {
          this.selectedProductIds = data.map((item) => item.id);
        });
    }
  }

  private fillProductsDataSource(): void {
    const selectedProducts =
      (this.selectedProductIds &&
        this.selectedProductIds
          .map((id) => {
            return this.stockitems.find((product) => product.id === id);
          })
          .filter((v) => v)) ||
      [];
    console.log('TCL: AddOrderComponent -> selectedProducts', selectedProducts);

    this.productsDataSource = selectedProducts.length
      ? selectedProducts
      : this.tablePlaceholder;
    this.changeSupplierProducts.emit(selectedProducts);
  }

  onRemoveProduct(row: any): void {
    if (row.placeholder) {
      return;
    }
    // only one supplier
    if (row.suppliers && row.suppliers.length === 1) {
      console.log('will not delete product with only one supplier!');
      return;
    }
    remove(this.selectedProductIds, (r: any) => r === row.id);
    this.selectedProductIds = [...this.selectedProductIds];
  }

  getStockitems = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        withoutTypeFlag: StockItemType.Manufactured.toString(),
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
      },
    });
    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client.get('stockitems', { params }).pipe(this.tap);
  };

  getStockitemById = (id: number): Observable<any> => {
    const params = new HttpParams({
      fromObject: {
        withoutTypeFlag: StockItemType.Manufactured.toString(),
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
      },
    });
    return this.client
      .get(`stockitems/${id}`, {
        params: params,
      })
      .pipe(this.tap);
  };

  private get tap(): MonoTypeOperatorFunction<unknown> {
    return tap((items: any) => {
      items = items.data || [items];
      if (items) {
        this.stockitems = uniqBy([...this.stockitems, ...items], 'id');
        this.fillProductsDataSource();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
