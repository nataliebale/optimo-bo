import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { MonoTypeOperatorFunction, Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { remove, uniqBy } from 'lodash-es';
import { tap } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { NgModel, Validators } from '@angular/forms';
import { InventorisationCriteria } from 'apps/dashboard/src/app/core/enums/inventorisation-criteria.enum';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';

@Component({
  selector: 'app-inventorisation-detail-list',
  templateUrl: './inventorisation-detail-list.component.html',
  styleUrls: ['./inventorisation-detail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorisationDetailListComponent {
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: DynamicSelectComponent;
  @ViewChild('dynamicSelectorModel', { static: true })
  dynamicSelectorModel: NgModel;

  productsDataSource: any[];
  displayedColumns: ColumnData[];

  InventorisationCriteria = InventorisationCriteria;
  private _criteria: InventorisationCriteria;

  @Input()
  set criteria(value: InventorisationCriteria) {
    this._criteria = value;
    this.productsDataSource = this.tablePlaceholder;
    this.products = [];
    this.selectedProductIds = [];
    this.displayedColumns = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    this.dynamicSelector.reload();
    const columns: ColumnData[] = [
      {
        dataField: 'name',
        columnType: ColumnType.Text,
        caption: 'Inventorisations.Item.Details.List.TableColumns.name',
        filterable: false,
        sortable: false,
      },
    ];

    switch (value) {
      case InventorisationCriteria.StockItem: {
        columns.push({
          dataField: 'barcode',
          columnType: ColumnType.Text,
          caption: 'Inventorisations.Item.Details.List.TableColumns.barcode',
          filterable: false,
          sortable: false,
          widthCoefficient: 1.8,
        });
        break;
      }
      case InventorisationCriteria.Supplier: {
        columns.push({
          dataField: 'phoneNumber',
          columnType: ColumnType.Text,
          caption:
            'Inventorisations.Item.Details.List.TableColumns.phoneNumber',
          filterable: false,
          sortable: false,
          widthCoefficient: 1.8,
        });
        break;
      }
    }

    this.displayedColumns = columns;
    this.cdr.detectChanges();
  }

  get criteria(): InventorisationCriteria {
    return this._criteria;
  }

  @Input() // inputs ordering is important
  set criteriaValues(value: any[]) {
    if (value) {
      this.selectedProductIds = value;
      this.cdr.markForCheck();
    }
  }

  @Output()
  changeCriteriaValues = new EventEmitter<any[]>();

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
    //   phoneNumber: '—',
    // },
  ];

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private fillProductsDataSource(): void {
    const selectedProducts =
      (this.selectedProductIds &&
        this.selectedProductIds
          .map((id) => {
            const productToAdd = this.products.find(
              (product) => product.id === id
            );
            return (
              productToAdd && {
                id: productToAdd.id,
                name: productToAdd.name,
                barcode: productToAdd.barcode,
                phoneNumber: productToAdd.phoneNumber,
              }
            );
          })
          .filter((v) => v)) ||
      [];

    this.productsDataSource = selectedProducts.length
      ? selectedProducts
      : this.tablePlaceholder;
    this.changeCriteriaValues.emit(this.selectedProductIds);
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

    return this.client.get(`${this.endpoint}`, { params }).pipe(this.tap);
  };

  getProductById = (id: number): Observable<any> => {
    if (typeof id !== 'number') {
      return of();
    }
    return this.client.get(`${this.endpoint}/${id}`).pipe(this.tap);
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

  public markFormGroupTouched(): void {
    if (!this.selectedProductIds || !this.selectedProductIds.length) {
      this.dynamicSelectorModel.control.setValidators(Validators.required);
      this.dynamicSelectorModel.control.updateValueAndValidity();
    }
    this.cdr.markForCheck();
  }

  private get endpoint(): string {
    switch (this.criteria) {
      case InventorisationCriteria.Category: {
        return 'stockitemcategories';
      }
      case InventorisationCriteria.Supplier: {
        return 'suppliers';
      }
      case InventorisationCriteria.StockItem: {
        return 'stockitems';
      }
    }
  }

  get selectLabelTranslateKey(): string {
    switch (this.criteria) {
      case InventorisationCriteria.Category: {
        return 'Inventorisations.Item.Details.List.Label_Category';
      }
      case InventorisationCriteria.Supplier: {
        return 'Inventorisations.Item.Details.List.Label_Supplier';
      }
      case InventorisationCriteria.StockItem: {
        return 'Inventorisations.Item.Details.List.Label_Products';
      }
      default: {
        return 'აირჩიე';
      }
    }
  }
}
