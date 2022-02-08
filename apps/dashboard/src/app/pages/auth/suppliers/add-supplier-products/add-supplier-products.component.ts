import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';

import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';

@Component({
  selector: 'app-add-supplier-products',
  templateUrl: './add-supplier-products.component.html',
  styleUrls: ['./add-supplier-products.component.scss'],
})
export class AddSupplierProductsComponent implements OnInit {
  @ViewChild('trigger') trigger: MatAutocompleteTrigger;

  addProductInput = new FormControl();
  options = null;
  filteredOptions: Observable<string[]>;

  supplierProducts = [];
  supplierId = null;
  supplierProductsForm: FormGroup;
  selectedOption: any;
  selectedProduct: any;
  supplierFormVar = false;
  supplierTableVar = true;
  filteredOptionsArray: any;
  optionVar = true;
  selectedRows = [];

  stockItemsDiplayedColumns = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.SUPPLIER_PRODUCTS.LIST.TABLE_COLUMNS.TITLE',
      sortable: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'SUPPLIERS.SUPPLIER_PRODUCTS.LIST.TABLE_COLUMNS.UNIT_COST',
      sortable: true,
    },
  ];

  constructor(
    private notificator: NotificationsService,
    private client: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef
  ) {
    this.getDataForProductsAssign();
  }

  ngOnInit() {
    this.buildSupplierProductsForm();
    this.generateFilterOptions();
  }
  onSelectionChanged(selectedRows: any[]): void {
    this.selectedRows = selectedRows;
  }
  generateFilterOptions() {
    this.filteredOptions = this.addProductInput.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterProducts(value))
    );
  }

  buildSupplierProductsForm() {
    this.supplierProductsForm = this.fb.group({
      addProduct: [null],
    });
  }

  getDataForProductsAssign() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params && params.id) {
        this.supplierId = params.id;
        this.generateProductsArray();
        this.generateGridSource();
      }
    });
  }

  onBackButtonClick() {
    this.router.navigate(['/suppliers']);
  }

  onOptionSelect(event: MatAutocompleteSelectedEvent) {
    this.selectedOption = event.option.value;
  }

  filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase();
    this.generateProductsArray();
    this.filteredOptionsArray = this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
    return this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  private async generateGridSource() {
    this.supplierProducts = await this.getSupplierProducts();
    this.cdr.detectChanges();
  }

  async deleteSupplierProducts() {
    this.selectedRows.forEach(async (item) => {
      const requestObj = {
        supplierId: this.supplierId,
        stockItemIds: [item.id],
      };
      await this.deleteAndRefreshProducts(requestObj, item);
    });
  }

  arrayRemove(arr, value) {
    return arr.filter(function (ele) {
      return ele != value;
    });
  }

  private async deleteAndRefreshProducts(requestObj, item) {
    try {
      await this.client.delete('suppliers/stockitems', requestObj).toPromise();
      this.notificator.saySuccess('Item successfuly deleted');
      this.supplierProducts = this.arrayRemove(this.supplierProducts, item);
      this.generateGridSource();
      this.cdr.detectChanges();
    } catch (err) {}
  }

  private addItemInArray(array, value) {
    array[array.length] = value;
  }

  onSelectionChange(event: MatOptionSelectionChange, option) {
    if (event.source.selected) {
      this.selectedProduct = option;
    }
  }

  async onEnter() {
    if (this.filteredOptionsArray.length === 0) {
      this.notificator.sayError('Choose product from list');
      this.setValue(this.supplierProductsForm, 'addProduct', null);
      this.generateFilterOptions();
      this.trigger.openPanel();
      return false;
    }
    this.chooseFirstArrayItem();
    if (this.supplierProducts.some((e) => e.id === this.selectedProduct.id)) {
      this.notificator.sayError('This item is already in the table!');
      this.setValue(this.supplierProductsForm, 'addProduct', null);
      this.selectedProduct = null;
      this.selectedOption = null;
      this.generateFilterOptions();
      this.trigger.openPanel();
      return false;
    }
    this.addItemInArray(this.supplierProducts, this.selectedProduct);

    await this.postSupplierProduct(this.selectedProduct.id, this.supplierId);
    this.setValue(this.supplierProductsForm, 'addProduct', null);
    this.selectedProduct = null;
    this.selectedOption = null;
    this.filteredOptionsArray = [];
    this.generateFilterOptions();
    this.trigger.openPanel();
    this.generateGridSource();
  }

  chooseFirstArrayItem() {
    if (this.selectedOption == null && this.filteredOptionsArray.length != 0) {
      this.selectedProduct = this.filteredOptionsArray[0];
      this.selectedOption = this.filteredOptionsArray[0].name;
    }
  }

  private setValue(formName, controlName, newValue) {
    formName.controls[controlName].setValue(newValue);
    formName.controls[controlName].markAsDirty();
  }

  private async generateProductsArray() {
    this.options = await this.getProductsData();
    this.cdr.detectChanges();
  }

  private async getProductsData() {
    const headers: HttpHeaders = new HttpHeaders();
    let params = new HttpParams();
    const pageIndex = 0;
    const pageSize = 25;
    params = params.append('sortField', 'dateModified');
    params = params.append('sortOrder', 'DESC');
    params = params.append('pageIndex', `${pageIndex}`);
    params = params.append('pageSize', `${pageSize}`);
    try {
      const result = await this.client
        .get<any>('stockitems', { headers, params })
        .toPromise();
      return result ? result.data : null;
    } catch (err) {}
  }

  private async postSupplierProduct(itemId: number, supId: number) {
    const productPutRequest = {
      stockItemId: itemId,
      supplierId: supId,
    };
    try {
      await this.client
        .post('suppliers/stockitems', productPutRequest)
        .toPromise();
      this.notificator.saySuccess('product added successfully!');
    } catch (err) {}
  }

  private async getSupplierProducts() {
    const headers: HttpHeaders = new HttpHeaders();
    let params = new HttpParams();
    const pageIndex = 0;
    const pageSize = 25;
    params = params.append('sortField', 'dateModified');
    params = params.append('sortOrder', 'DESC');
    params = params.append('pageIndex', `${pageIndex}`);
    params = params.append('pageSize', `${pageSize}`);
    try {
      const result = await this.client
        .get<any>(`suppliers/${this.supplierId}/stockitems`, {
          headers,
          params,
        })
        .toPromise();
      return result ? result.data : null;
    } catch (err) {}
  }
}
