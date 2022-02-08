import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { Subject, EMPTY, Observable, forkJoin } from 'rxjs';
import { ClientService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import {
  VATTypes,
  arrayOfVATTypes,
} from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { mapOfMeasurementUnitsShort } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { SuppliesChangePopupComponent } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.component';
import { StockItemTransactionType } from 'apps/dashboard/src/app/core/enums/stockitem-transaction-type.enum';
import { HoldingType } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { Router } from '@angular/router';
import { RoutingStateService } from '@optimo/core';
import { getUMOAcronym } from '@optimo/ui-table';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-ingredient-detail',
  templateUrl: './ingredient-detail.component.html',
  styleUrls: ['./ingredient-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientDetailComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;
  isSubmited: boolean;
  requestIsSent: boolean;
  mapOfMeasurementUnitsShort = mapOfMeasurementUnitsShort;
  arrayOfVATTypes = arrayOfVATTypes;

  private suppliesChangeData: {
    reason: number;
    supplies: number;
    holdingType: HoldingType;
  };

  private editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<IngredientDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private router: Router,
    private routingState: RoutingStateService,
    private _translateService: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && this.params.id ? 'Edit Ingredient' : 'Add Ingredient'
    );
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  private getItemForEdit(): void {
    this.client
      .get<any>(`stockitems/${this.editId}`) // todo:
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
        this.item = result;
        this.createForm();
      });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      details: this.formBuilder.group({
        photoId: [this.item && this.item.photoId],
        categoryId: [this.item && this.item.categoryId, [Validators.required]],
        supplierIds: [
          this.item &&
            this.item.suppliers &&
            this.item.suppliers.map((s: any) => s.id),
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
      }),

      price: this.formBuilder.group({
        unitCost: [
          {
            value: this.item && this.item.unitCost,
            disabled: this.editId,
          },
          [Validators.required],
        ],
        quantityOnHand: [this.item && this.item.quantity.toFixed(4)],
      }),
    });
    this.cdr.markForCheck();
    console.log('TCL: this.form', this.form);
  }

  onCancel(): void {
    if (this.form.dirty) {
      this.showCancelDialog();
    } else {
      this.close();
    }
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
          if (duplicateBarCode && !this.editId) {
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

  private showApproveModal(duplicateBarCode: boolean) {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'Ingredients.addIngredients',
          message: duplicateBarCode
            ? `${this._translateService.instant(
                'Ingredients.Ingredient'
              )} "${this.getValue(
                'details',
                'barcode'
              )}" ${this._translateService.instant(
                'Ingredients.BARCODE_ALREADY_EXISTS_WARNING'
              )}?`
            : `${this._translateService.instant('Ingredients.SAVE_WARNING')}?`,
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
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
      type: StockItemType.Ingredient,
    };
    console.log(data);
    this.client
      .post<any>('stockitems', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this._mixpanelService.track('Add Ingredient (Success)');
          this.notificator.saySuccess(
            this._translateService.instant('Ingredients.Item.addSuccessMessage')
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
    if (this.isControlDirty('details') || this.isControlDirty('price')) {
      requests.push(this.upadteStockItemDetails());
    }

    if (this.suppliesChangeData) {
      requests.push(this.updateSuppliesRequest);
    }

    if (requests.length) {
      forkJoin(requests)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this._mixpanelService.track('Edit Ingredient (Success)');
            this.notificator.saySuccess(
              this._translateService.instant(
                'Ingredients.Item.updateSuccessMessage'
              )
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

  private upadteStockItemDetails(): Observable<any> {
    return this.client.put<any>('stockitems', {
      id: this.item.id,
      ...this.getValue('details'),
      ...this.getValue('price'),
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

  onGenerateName(): void {
    let randomSufix = '';
    for (let i = 0; i < 8; i++) {
      randomSufix += Math.floor(Math.random() * 10);
    }
    this.form.controls.name.setValue(
      `${this._translateService.instant('GENERAL.SHIPPING')}_${randomSufix}`
    );
  }

  private showCancelDialog() {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
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

  isControlDirty(
    groupName: 'details' | 'price',
    controlName?: string
  ): boolean {
    const path: string[] = [groupName];
    if (controlName) {
      path.push(controlName);
    }
    return this.form.get(path)?.dirty ?? false;
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/ingredients'
    );
  }

  private markFormGroupTouched(): void {
    Object.values((this.form.get('details') as FormGroup).controls).forEach(
      (control) => {
        control.markAsTouched();
      }
    );
    Object.values((this.form.get('price') as FormGroup).controls).forEach(
      (control) => {
        control.markAsTouched();
      }
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

  getValue(groupName: 'details' | 'price', controlName?: string): any {
    const path: string[] = [groupName];
    if (controlName) {
      path.push(controlName);
    }
    return this.form.get(path)?.value;
  }

  get title(): string {
    return this.editId
      ? 'Ingredients.Item.editIngredients'
      : 'Ingredients.Item.addIngredients';
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && !!control.errors && !control.errors.required;
  }

  onPhotoUploaded(photoId: any): void {
    if (photoId) {
      this.setValue('details', 'photoId', photoId);
    }
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

  get VATAmount() {
    return this.getValue('details', 'vatRateType') === VATTypes.Standard
      ? (this.getValue('price', 'unitPrice') * 18) / 100
      : 0;
  }

  private setValue(
    groupName: 'details' | 'price',
    controlName: string,
    value: any
  ): void {
    this.form.get([groupName, controlName])?.setValue(value);
    this.form.get([groupName, controlName])?.markAsDirty();
  }

  onAddSupplier(): void {
    this.router.navigate(['/suppliers/add']).then(() => {
      this.routingState.removePreviousUrl();
    });
  }

  get unitOfMeasurementAcronym(): string {
    return getUMOAcronym(this.getValue('details', 'unitOfMeasurement')) || '';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getQuantityOnHandTouched = (): boolean => {
    return this?.form?.get(['price', 'quantityOnHand'])?.touched;
  };
}
