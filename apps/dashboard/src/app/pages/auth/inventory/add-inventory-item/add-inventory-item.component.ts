import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { EMPTY, forkJoin, Observable, Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  mapOfMeasurementUnits,
  getUMOAcronym,
  mapOfMeasurementUnitsShort,
} from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import {
  arrayOfVATTypes,
  VATTypes,
} from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { SuppliesChangePopupComponent } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.component';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { HoldingType } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { startOfTomorrow, formatRFC3339 } from 'date-fns';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingStateService } from '@optimo/core';
import { StockItemTransactionType } from 'apps/dashboard/src/app/core/enums/stockitem-transaction-type.enum';
import { AttributeTypeName } from 'apps/dashboard/src/app/core/enums/attributes.enum';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-add-inventory-item',
  templateUrl: './add-inventory-item.component.html',
  styleUrls: ['./add-inventory-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInventoryItemComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;
  startDate: Date;
  isDatePickerVisible: boolean;
  minDate = new Date();
  startOfTomorrow = startOfTomorrow();
  margeShowType: 'percent' | 'amount' = 'percent';
  attributes: any;

  mapOfMeasurementUnits = mapOfMeasurementUnits;
  mapOfMeasurementUnitsShort = mapOfMeasurementUnitsShort;

  arrayOfVATTypes = arrayOfVATTypes;
  isSubmited: boolean;
  requestIsSent: boolean;

  private _imeis: string[];

  set imeis(value: string[]) {
    this._imeis = value;
    this.form.get('details').markAsDirty();
  }

  get imeis(): string[] {
    return this._imeis;
  }

  isImeisVisible: boolean;
  private unsubscribe$ = new Subject<void>();
  editId: number;
  private suppliesChangeData: {
    reason: number;
    supplies: number;
    holdingType: HoldingType;
  };

  // instance for caching attribute data
  itemColors: any[];
  itemSizes: any[];
  // instance variables for additional data checkbox
  isAttributesVisible = false;

  toggleAdditionalData() {
    this.isAttributesVisible = !this.isAttributesVisible;
    if (!this.isAttributesVisible) {
      Object.values(
        (this.form.get('attributes') as FormGroup).controls
      ).forEach((control) => {
        control.clearValidators();
        control.updateValueAndValidity();
      });
      this.form.get('attributes').markAsPristine();
      this.form.get('attributes').markAsUntouched();
    } else {
      Object.values(
        (this.form.get('attributes') as FormGroup).controls
      ).forEach((control) => {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      });
      this.form.get('attributes').markAsDirty();
    }
    this.cdr.markForCheck();
  }

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddInventoryItemComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private client: ClientService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private routingState: RoutingStateService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && this.params.id ? 'Edit Product' : 'Add Product'
    );
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
      this.getImeis();
    } else {
      this.getPackageTypeFromRoute();
      this.createForm();
    }
    this.fetchAttributeValues();
  }

  private getItemForEdit(): void {
    this.client
      .get<any>(`stockitems/${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        if (!result) {
          this.close();
        }
        this.item = { editing: true, ...result };
        this.isAttributesVisible =
          result.stockItemAttributes && result.groupId ? true : false;
        console.log('TCL: AddInventoryItemComponent -> this.item', this.item);
        this.createForm();
      });
  }

  get unitOfMeasurementAcronym(): string {
    return getUMOAcronym(this.getValue('details', 'unitOfMeasurement')) || '';
  }

  private getPackageTypeFromRoute(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        if (params && Object.keys(params).length) {
          this.item = {
            suppliers: params.supplierId && [{ id: +params.supplierId }],
            barcode: params.barcode,
            name: params.name,
            unitCost: params.unitCost && +params.unitCost,
          };
        }
        this.createForm();
      });
  }

  private createForm(): void {
    this.startDate =
      (this.item &&
        this.item.newUnitPriceValidFrom &&
        new Date(this.item.newUnitPriceValidFrom)) ||
      new Date();
    this.form = this.formBuilder.group({
      details: this.formBuilder.group({
        photoId: [this.item && this.item.photoId],
        categoryId: [this.item && this.item.categoryId, [Validators.required]],
        supplierIds: [
          this.item &&
            this.item.suppliers &&
            this.item.suppliers.map((s) => s.id),
          [Validators.required],
        ],
        barcode: [this.item && this.item.barcode, [Validators.required]],
        name: [this.item && this.item.name, [Validators.required]],
        description: [this.item && this.item.description],
        lowStockThreshold: [
          this.item && this.item.lowStockThreshold,
          [Validators.required],
        ],
        unitOfMeasurement: [
          {
            value: this.item && this.item.unitOfMeasurement,
            disabled: this.editId,
          },
          [Validators.required],
        ],
        vatRateType: [
          this.item && this.item.vatRateType,
          [Validators.required],
        ],
      }),
      attributes: this.formBuilder.group({
        attributeColor: [
          this.item?.stockItemAttributes?.find(
            (attr) => attr.name === AttributeTypeName.Color
          ).values[0],
          [
            this.item?.stockItemAttributes
              ? Validators.required
              : Validators.nullValidator,
          ],
        ],
        attributeSize: [
          this.item?.stockItemAttributes?.find(
            (attr) => attr.name === AttributeTypeName.Size
          ).values[0],
          [
            this.item?.stockItemAttributes
              ? Validators.required
              : Validators.nullValidator,
          ],
        ],
        attributeGroupId: [
          this.item?.groupId,
          this.item?.groupId && this.item?.stockItemAttributes
            ? [Validators.required]
            : [Validators.nullValidator],
        ],
      }),
      price: this.formBuilder.group({
        unitPrice: [
          this.item && this.item?.unitPrice?.toFixed(4),
          [Validators.required, CustomValidators.MoreThan(0)],
        ],
        // unitPriceMin: [
        //   this.item && this.item.unitPriceMin,
        //   [Validators.required]
        // ],
        quantityOnHand: [this.item && this.item?.quantity?.toFixed(4)],
        unitCost: [
          {
            value: this.item && this.item?.unitCost?.toFixed(4),
            disabled: this.item && this.item.editing,
          },
          [Validators.required, CustomValidators.MoreThan(0)],
        ],
        startDate: [this.startDate],
        marginNumber: [
          {
            value: this.item && this.item?.marginAmount?.toFixed(4),
            disabled: this.item && this.item.editing,
          },
          [Validators.required],
        ],
        marginPercent: [
          {
            value: this.item && this.item?.marginRate?.toFixed(4),
            disabled: this.item && this.item.editing,
          },
          [Validators.required],
        ],
      }),
    });
    this.cdr.markForCheck();
    console.log('TCL: this.form', this.form);
  }

  onSubmit(): void {
    this.isSubmited = true;
    console.log('TCL: AddInventoryItemComponent -> this.form', this.form);
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.requestIsSent = true;
    this.cdr.markForCheck();

    this.client
      .get<any>(
        `stockitems/${encodeURIComponent(
          this.getValue('details', 'barcode')
        )}/exists`
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (duplicateBarCode: boolean) => {
          if (
            (this.getValue('price', 'unitPrice') <
              this.getValue('price', 'unitCost') ||
              duplicateBarCode) &&
            !this.editId
          ) {
            this.showApproveModal(duplicateBarCode);
          } else {
            this.sendNeededRequest();
          }
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  private getImeis(): void {
    this.client
      .get<any>(`stockitems/${this.editId}/imeis`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        if (data && data.length) {
          this._imeis = data;
          this.onImeisToggle();
          this.cdr.markForCheck();
        }
      });
  }

  private showApproveModal(duplicateBarCode: boolean) {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'პროდუქტის დამატება',
          message: duplicateBarCode
            ? `${this.translate.instant('GENERAL.PRODUCT')} "${this.getValue(
                'details',
                'barcode'
              )}" ${this.translate.instant(
                'INVENTORY.EDIT.BARCODE_ALREADY_EXISTS_WARNING'
              )}?`
            : `${this.translate.instant('INVENTORY.EDIT.SAVE_WARNING')}?`,
          approveBtnLabel: this.translate.instant('INVENTORY.BUTTON_CONFIRM'),
          denyBtnLabel: this.translate.instant('INVENTORY.BUTTON_DENY'),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.sendCreateRequest();
        } else {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      });
  }

  private sendNeededRequest(): void {
    if (this.editId) {
      this.sendUpdateRequest();
    } else {
      this.sendCreateRequest();
    }
  }

  private sendCreateRequest(): void {
    const priceData = this.getValue('price');
    const data = {
      ...this.getValue('details'),
      ...priceData,
      quantityOnHand: priceData.quantityOnHand || 0,
      approvedQuantity: priceData.approvedQuantity || 0,
      imeis: this.isImeisVisible ? this.imeis : null,
      ...this.getAttributesForSubmit(),
    };
    this.client
      .post<any>('stockitems', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this._mixpanelService.track('Add Product (Success)');
          this.notificator.saySuccess(
            this.translate.instant('INVENTORY.EDIT.PRODUCT_ADD_SUCCESS')
          );
          this.close();
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  private sendUpdateRequest() {
    const requests = new Array<Observable<any>>();
    if (this.isControlDirty('details') || this.isControlDirty('attributes')) {
      requests.push(this.upadteStockItemDetails());
    }

    if (this.isPriceChanged) {
      // requests.push(this.addNewPrice());
      this.addNewPrice()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this._mixpanelService.track(
              this.editId
                ? 'Edit Price Bulk (Success)'
                : 'Add Price Bulk (success)'
            );
            this.cdr.markForCheck();
          },
          error: () => {
            this.requestIsSent = false;
            this.cdr.markForCheck();
          },
        });
    }

    if (this.suppliesChangeData) {
      requests.push(this.updateSuppliesRequest);
    }

    if (requests.length) {
      forkJoin(requests)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            // track Add to Stock
            if (
              this.suppliesChangeData &&
              this.suppliesChangeData.reason ===
                StockItemTransactionType.StocktakePlus
            ) {
              this._mixpanelService.track('Add to Stock', {
                method: 'Stock Update',
              });
            }
            this._mixpanelService.track('Edit Product (Success)');
            this.notificator.saySuccess(
              this.translate.instant('INVENTORY.EDIT.PRODUCT_UPDATE_SUCCESS')
            );
            this.close();
          },
          error: () => {
            this.requestIsSent = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      this.close();
    }
  }

  private get updateSuppliesRequest(): Observable<any> {
    return this.client.post<any>('stockitems/transactions', {
      transactionType: this.suppliesChangeData.reason,
      stockItemId: this.item.id,
      holdingType: this.suppliesChangeData.holdingType,
      quantity: this.suppliesChangeData.supplies,
    });
  }

  onUpdateSupplies(): void {
    if (!this.item || (!this.item.quantity && this.item.quantity !== 0)) {
      return;
    }
    this.dialog
      .open(SuppliesChangePopupComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
        data: {
          item: this.item,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.suppliesChangeData = result;
        this.setValue(
          'price',
          'quantityOnHand',
          this.suppliesChangeData.reason ===
            StockItemTransactionType.StocktakePlus
            ? this.item.quantity + result.supplies
            : this.item.quantity - result.supplies
        );
      });
  }

  private upadteStockItemDetails(): Observable<any> {
    return this.client.put<any>('stockitems', {
      id: this.item.id,
      ...this.getValue('details'),
      imeis: this.isImeisVisible ? this.imeis : null,
      ...this.getAttributesForSubmit(),
    });
  }

  private addNewPrice(): Observable<any> {
    const pricePutRequest = {
      stockItemId: this.item.id,
      unitPrice: +this.getValue('price', 'unitPrice'),
      validFrom: formatRFC3339(this.getValue('price', 'startDate')),
    };

    return this.client.post<any>('stockitems/prices', pricePutRequest);
  }

  onCancel(): void {
    if (this.form.pristine) {
      this.close();
      return;
    }

    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: this.translate.instant('INVENTORY.EDIT.CANCEL_TITLE') + '?',
          message: this.translate.instant('INVENTORY.EDIT.CANCEL_MESSAGE'),
          approveBtnLabel: this.translate.instant('INVENTORY.BUTTON_CONFIRM'),
          denyBtnLabel: this.translate.instant('INVENTORY.BUTTON_DENY'),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.close();
        }
      });
  }

  onAddCategory(): void {
    this.dialog
      .open(AddCategoryDialogComponent, {
        width: '548px',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((id) => {
        if (id) {
          this.setValue('details', 'categoryId', id);
        }
      });
  }

  onPhotoUploaded(photoId: any): void {
    if (photoId) {
      this.setValue('details', 'photoId', photoId);
    }
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/inventory'
    );
  }

  getValue(
    groupName: 'details' | 'price' | 'attributes',
    controlName?: string
  ): any {
    const path: string[] = [groupName];
    if (controlName) {
      path.push(controlName);
    }
    return this.form.get(path).value;
  }

  isControlDirty(
    groupName: 'details' | 'price' | 'attributes',
    controlName?: string
  ): boolean {
    const path: string[] = [groupName];
    if (controlName) {
      path.push(controlName);
    }
    return this.form.get(path).dirty;
  }

  private setValue(
    groupName: 'details' | 'price',
    controlName: string,
    value: any
  ): void {
    this.form.get([groupName, controlName]).setValue(value);
    this.form.get([groupName, controlName]).markAsDirty();
  }

  get isPriceChanged(): boolean {
    return (
      this.isControlDirty('price', 'unitPrice') &&
      this.item.unitPrice !== this.getValue('price', 'unitPrice')
    );
  }

  getStockitemCategories = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [
          CategoryStatuses.Enabled.toString(),
          CategoryStatuses.Disabled.toString(),
        ],
      },
    });

    if (state.searchValue && state.searchValue !== '') {
      params = params.append('name', state.searchValue);
    }

    return this.client.get<any>('stockitemcategories', { params });
  };

  getStockitemCategoryById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitemcategories/${id}`);
  };

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

  fetchAttributeValues(): void {
    this.client.get<any>('stockitems/attributes').subscribe((response) => {
      console.log(response);
      this.itemColors = response.find(
        (attributeType) => attributeType.name === AttributeTypeName.Color
      );
      this.itemSizes = response.find(
        (attributeType) => attributeType.name === AttributeTypeName.Size
      );
    });
  }

  onStartDateChange(date: Date): void {
    const now = new Date();
    if (date < now) {
      date = now;
    }
    this.setValue('price', 'startDate', date);
    this.startDate = date;
    this.isDatePickerVisible = false;
    this.cdr.markForCheck();
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  onToggleMargeType(): void {
    this.margeShowType =
      this.margeShowType === 'percent' ? 'amount' : 'percent';
  }

  calcFromUnitCost(cost: string): void {
    const unitCost: number = this.parseFloat(cost);
    const price = this.parseFloat(this.getValue('price', 'unitPrice'));
    if (price) {
      const marginNumber: number = price - unitCost;
      const marginPercent: number = (marginNumber / unitCost) * 100;

      this.setValue('price', 'marginNumber', marginNumber.toFixed(4));
      this.setValue('price', 'marginPercent', marginPercent.toFixed(4));
    }
  }

  calcFromMarginPercent(percent: string): void {
    const marginPercent: number = this.parseFloat(percent);
    const unitCost: number = parseFloat(this.getValue('price', 'unitCost'));
    if (unitCost) {
      const marginNumber: number = (unitCost * marginPercent) / 100;
      const price: number = unitCost + marginNumber;

      this.setValue('price', 'marginNumber', marginNumber.toFixed(4));
      this.setValue('price', 'unitPrice', price.toFixed(4));
    }
  }

  calcFromMarginNumber(marginNumber: string): void {
    const unitCost: number = this.parseFloat(
      this.getValue('price', 'unitCost')
    );

    if (unitCost) {
      const price: number = unitCost + this.parseFloat(marginNumber);
      const marginPercent: number =
        (this.parseFloat(marginNumber) / unitCost) * 100;

      this.setValue('price', 'unitPrice', price.toFixed(4));
      this.setValue('price', 'marginPercent', marginPercent.toFixed(4));
    }
  }

  calcFromUnitPrice(price: string): void {
    const unitPrice: number = this.parseFloat(price);
    const unitCost: number = this.parseFloat(
      this.getValue('price', 'unitCost')
    );

    if (unitCost) {
      const marginNumber: number = unitPrice - unitCost;
      const marginPercent: number = (marginNumber / unitCost) * 100;

      this.setValue('price', 'marginNumber', marginNumber.toFixed(4));
      this.setValue('price', 'marginPercent', marginPercent.toFixed(4));
    }
  }

  private markFormGroupTouched(): void {
    Object.values((this.form.get('price') as FormGroup).controls).forEach(
      (control) => {
        control.markAsTouched();
      }
    );
    Object.values((this.form.get('details') as FormGroup).controls).forEach(
      (control) => {
        control.markAsTouched();
      }
    );
    Object.values((this.form.get('attributes') as FormGroup).controls).forEach(
      (control) => {
        control.markAsTouched();
      }
    );
  }

  get VATAmount() {
    const vatRate =
      this.getValue('details', 'vatRateType') === VATTypes.Standard
        ? (this.getValue('price', 'unitPrice') * 18) / 118
        : 0;
    return vatRate;
  }

  onImeisToggle(): void {
    this.isImeisVisible = !this.isImeisVisible;
  }

  getAttributesForSubmit() {
    return this.isAttributesVisible
      ? {
          stockItemAttributes: [
            {
              ...this.itemColors,
              values: [this.getValue('attributes', 'attributeColor')],
            },
            {
              ...this.itemSizes,
              values: [this.getValue('attributes', 'attributeSize')],
            },
          ],
          groupId: this.getValue('attributes', 'attributeGroupId'),
        }
      : null;
  }

  onAddSupplier(): void {
    this.router.navigate(['/suppliers/add']).then(() => {
      this.routingState.removePreviousUrl();
    });
  }
  // getValidationErrors(
  //   control: AbstractControl,
  //   controlName: string = 'self'
  // ): any[] {
  //   let errors = [];
  //   if (control.errors) {
  //     const validationErrorName = Object.keys(control.errors);
  //     errors = [
  //       { controlName, error: validationErrorName && validationErrorName[0] }
  //     ];
  //   }

  //   const children = (control as FormGroup).controls;
  //   if (children) {
  //     for (const key in children) {
  //       if (children.hasOwnProperty(key)) {
  //         const child = children[key];
  //         errors.push(this.getValidationErrors(child, key));
  //       }
  //     }
  //   }
  //   return flatten(errors);
  // }

  // get errorMessages(): string[] {
  //   const nameMaps = {
  //     photoId: 'სურათი',
  //     categoryId: 'კატეგორია',
  //     supplierId: 'მომწოდებელი',
  //     barcode: 'ბარკოდი/SKU',
  //     name: 'პროდუქტის დასახელება',
  //     lowStockThreshold: 'მინიმალური',
  //     unitOfMeasurement: 'ერთეული',
  //     vatRateType: 'დღგ-ს ტიპი',
  //     unitPrice: 'გასაყიდი ფასი',
  //     unitCost: 'შესყიდვების ფასი',
  //     marginNumber: 'მარჟა',
  //     marginPercent: 'მარჟა %'
  //   };

  //   const validationErrors = this.getValidationErrors(this.form);

  //   return validationErrors.map(validation => {
  //     switch (validation.error) {
  //       case 'required': {
  //         return ' გთხოვთ შეიყვანოთ ' + nameMaps[validation.controlName];
  //       }
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getQuantityOnHandTouched = (): boolean => {
    return this?.form?.get(['price', 'quantityOnHand'])?.touched;
  };

  parseFloat(value: string | number): number {
    return +value?.toString()?.replace(/,/g, '') || null;
  }
}
