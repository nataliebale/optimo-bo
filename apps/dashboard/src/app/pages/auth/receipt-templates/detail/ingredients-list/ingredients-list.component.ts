import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ColumnType, ColumnData, NumberColumnType } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { uniqBy, remove, sumBy } from 'lodash-es';
import { Observable, MonoTypeOperatorFunction, Subject, EMPTY } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { tap, takeUntil } from 'rxjs/operators';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { NgModel, Validators } from '@angular/forms';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
@Component({
  selector: 'app-ingredients-list',
  templateUrl: './ingredients-list.component.html',
  styleUrls: ['./ingredients-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsListComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  @ViewChild('dynamicSelector', { static: true })
  dynamicSelector: NgModel;

  @ViewChildren('usedQuantity')
  usedQuantityInputs: QueryList<any>;

  @Input()
  editId: number;

  @Input()
  editable: boolean;

  @Output()
  changeReceiptTemplates = new EventEmitter<any[]>();

  private ingredients: any[] = [];
  private tablePlaceholder = [
    // {
    //   placeholder: true,
    //   name: '—',
    //   usedQuantity: '—',
    //   unitOfMeasurementDescription: '—',
    //   unitCost: '—',
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
      widthCoefficient: 2,
    },
    {
      dataField: 'usedQuantity',
      columnType: ColumnType.Text,
      caption: 'GENERAL.QUANTITY',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'unitOfMeasurementDescription',
      columnType: ColumnType.Text,
      caption: 'GENERAL.UNIT',
      filterable: false,
      sortable: false,
    },
    {
      dataField: 'totalCost',
      columnType: ColumnType.Text,
      caption: 'GENERAL.COST',
      // data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: false,
      sortable: false,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  private _selectedReceiptTemplateIds: any[];
  templateItems: any;

  set selectedReceiptTemplateIds(value: any[]) {
    this._selectedReceiptTemplateIds = value;
    this.fillProductsDataSource();
  }

  get selectedReceiptTemplateIds(): any[] {
    return this._selectedReceiptTemplateIds;
  }

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.editId) {
      this.getItemForEdit();
    }
  }

  parseFloatWithCommas(value: string): number {
    const num = Number(value) < 0 ? '1' : value;

    return Number.parseFloat(num.replace(/,/g, ''));
  }

  checkValueToZero(value: string): string {
    return Number(value) === 0 ? '1' : value;
  }

  private getItemForEdit(): void {
    this.client
      .get<any>(`stockitemreceipttemplate/${this.editId}`) // todo:
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.templateItems = data.templateItems;

        this.selectedReceiptTemplateIds = data.templateItems.map(
          (item) => item.id
        );

        this.cdr.markForCheck();
      });
  }
  getReceiptTemplateById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitems/${id}`).pipe(this.tap);
  };

  private fillProductsDataSource(): void {
    this.ingredients.map((item) => {
      if (this.templateItems && item && !item.usedQuantity) {
        const tempItem = this.templateItems.find((temp) => temp.id === item.id);
        if (tempItem) {
          item.usedQuantity = tempItem.quantity;
        }
      }

      if (!item.usedQuantity) {
        item.usedQuantity = 1;
      }
    });

    const selectedReceiptTemplates =
      (this.selectedReceiptTemplateIds &&
        this.selectedReceiptTemplateIds
          .map((item) => {
            const ing = this.ingredients.find(
              (ingredient) => ingredient.id === item
            );
            return ing;
          })
          .filter((v) => v)) ||
      [];

    this.productsDataSource = selectedReceiptTemplates.length
      ? selectedReceiptTemplates
      : this.tablePlaceholder;
    this.changeReceiptTemplates.emit(selectedReceiptTemplates);
  }

  onRemoveProduct(row: any): void {
    if (row.placeholder) {
      return;
    }
    remove(this.selectedReceiptTemplateIds, (r: any) => r === row.id);
    this.selectedReceiptTemplateIds = [...this.selectedReceiptTemplateIds];
  }

  getIngredients = (state: any): Observable<any> => {
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
        withTypeFlag: StockItemType.Ingredient.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    const result = this.client
      .get<any>('stockitems', { params })
      .pipe(this.tap);

    return result;
  };

  getReceiptTemplateId = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitems/${id}`).pipe(this.tap);
  };

  private get tap(): MonoTypeOperatorFunction<unknown> {
    const result = tap((items: any) => {
      items = items.data || [items] || items.templateItems;
      if (items) {
        this.ingredients = uniqBy([...this.ingredients, ...items], 'id');
        this.fillProductsDataSource();
      }
    });
    return result;
  }

  public markFormGroupTouched(): void {
    this.usedQuantityInputs.forEach((model: NgModel) => {
      model.control.markAllAsTouched();
    });
    if (
      !this.selectedReceiptTemplateIds ||
      !this.selectedReceiptTemplateIds.length
    ) {
      this.dynamicSelector.control.setValidators(Validators.required);
      this.dynamicSelector.control.markAsTouched();
      this.dynamicSelector.control.updateValueAndValidity();
    }
    this.cdr.markForCheck();
  }

  get ingredientsTotalPrice(): number {
    console.log('www', this.productsDataSource);
    return sumBy(
      this.productsDataSource,
      (product) => product.usedQuantity * product.unitCost
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
