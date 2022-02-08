import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
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
import { mapOfMeasurementUnits } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { SuppliesChangePopupComponent } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.component';
import { StockItemTransactionType } from 'apps/dashboard/src/app/core/enums/stockitem-transaction-type.enum';
import { HoldingType } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { EditModes } from 'apps/dashboard/src/app/core/enums/edit-modes.enum';
import { RoutingStateService } from '@optimo/core';
import { startOfTomorrow, formatRFC3339 } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-receipt-detail',
  templateUrl: './receipt-detail.component.html',
  styleUrls: ['./receipt-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptDetailComponent implements OnInit, OnDestroy {
  @ViewChild(IngredientsListComponent)
  ingredientsListComponent: IngredientsListComponent;

  form: FormGroup;
  item: any;
  isSubmited: boolean;
  requestIsSent: boolean;
  mapOfMeasurementUnits = mapOfMeasurementUnits;

  gridDataSource = [];
  editMode = EditModes.Default;
  editModes = EditModes;

  // date picket variables
  isDatePickerVisible = false;
  startDate: Date;
  startOfTomorrow = startOfTomorrow();
  minDate = new Date();

  private suppliesChangeData: {
    reason: number;
    supplies: number;
    holdingType: HoldingType;
  };

  editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ReceiptDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private routingState: RoutingStateService,
    private _translateService: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && +this.params.id ? 'Edit Recipe' : 'Add Recipe'
    );
  }

  get isEditMode(): boolean {
    return this.editId && true;
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    this.cdr.markForCheck();
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  get isPriceChanged(): boolean {
    return (
      this.isControlDirty('unitPrice') &&
      this.item.unitPrice !== this.getValue('unitPrice')
    );
  }

  onStartDateChange(date: Date): void {
    const now = new Date();
    if (date < now) {
      date = now;
    }
    this.setValue('startDate', date);
    this.startDate = date;
    this.cdr.markForCheck();
  }

  private getItemForEdit(): void {
    this.client
      .get<any>(`stockitemreceipt/${this.editId}`) // todo:
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
        this.cdr.markForCheck();
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
      photoId: [this.item && this.item.photoId],
      categoryId: [this.item && this.item.categoryId, [Validators.required]],
      barcode: [this.item && this.item.barcode, [Validators.required]],
      name: [this.item && this.item.name, [Validators.required]],
      description: [this.item && this.item.description],
      unitOfMeasurement: [
        {
          value: this.item && this.item.unitOfMeasurement,
          disabled: this.editId,
        },
        [Validators.required],
      ],
      unitPrice: [this.item && this.item.unitPrice, [Validators.required]],
      // date picker date
      startDate: [this.startDate],
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
    if (this.form.invalid || !this.gridDataSource?.length) {
      this.markFormGroupTouched();
      return;
    }

    this.requestIsSent = true;
    this.cdr.markForCheck();

    this.client
      .get<any>(
        `stockitems/${encodeURIComponent(this.getValue('barcode'))}/exists`
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (duplicateBarCode: boolean) => {
          if (duplicateBarCode && !this.editId) {
            this.showApproveModal(duplicateBarCode);
          } else {
            // this.sendRequest();
            this.sendNeededRequests();
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
          title: 'Receipts.ITEM.add',
          message: duplicateBarCode
            ? `${this._translateService.instant(
                'GENERAL.RECEIPT'
              )} "${this.getValue('barcode')}" ${this._translateService.instant(
                'Receipts.ITEM.barcodeAlredyExist'
              )}`
            : 'Receipts.ITEM.saveWarning',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          // this.sendRequest();
          this.sendNeededRequests();
        } else {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      });
  }

  private sendRequest(): void {
    // obsolete after testing and deployments
    const requestBody = this.form.getRawValue();
    requestBody.items = this.gridDataSource;
    const neededRequest = this.getNeededRequest(requestBody);

    neededRequest.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this.close();
      },
      error: () => {
        this.requestIsSent = false;
        this.cdr.markForCheck();
      },
    });
  }

  private sendNeededRequests(): void {
    const neededRequest = this.neededRequests;
    // console.log('bugs =>', neededRequest);

    if (neededRequest.length) {
      forkJoin(neededRequest)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this._mixpanelService.track(
              this.editId
                ? 'Edit Recipe Template (Success)'
                : 'Add Recipe Template (Success)'
            );
            this.notificator.saySuccess(
              this._translateService.instant(
                'Receipts.ITEM.PRODUCT_UPDATE_SUCCESS'
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

  private get neededRequests(): Array<Observable<any>> {
    const requests = new Array<Observable<any>>();

    if (this.editId && this.isPriceChanged) {
      requests.push(this.priceUpdateRequest);
    }

    const requestBody = this.form.getRawValue();
    requestBody.items = this.gridDataSource;

    requests.push(this.getNeededRequest(requestBody));

    return requests;
  }

  private get priceUpdateRequest(): Observable<any> {
    const pricePutRequest = {
      stockItemId: this.item.stockItemId,
      unitPrice: +this.getValue('unitPrice'),
      validFrom: formatRFC3339(this.getValue('startDate')),
    };

    return this.client.post<any>('stockitems/prices', pricePutRequest);
  }

  private getNeededRequest(requestBody: object): Observable<any> {
    if (this.editId) {
      return this.client.put<any>('stockitemreceipt', {
        ...requestBody,
        id: this.editId,
      });
    }

    return this.client.post<any>('stockitemreceipt', requestBody);
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
          this.setValue('categoryId', id);
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

  isControlDirty(controlName?: string): boolean {
    const path: string[] = [];
    if (controlName) {
      path.push(controlName);
    }
    return this.form.get(path).dirty;
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/receipts'
    );
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    this.ingredientsListComponent.markFormGroupTouched();
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

  getValue(controlName) {
    return this.form.controls[controlName].value;
  }

  get title(): string {
    return this.editId ? 'Receipts.ITEM.edit' : 'Receipts.ITEM.add';
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
  }

  onPhotoUploaded(photoId: any): void {
    if (photoId) {
      this.setValue('photoId', photoId);
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

  private setValue(controlName, value) {
    this.form.controls[controlName].setValue(value);
    this.form.get(controlName).markAsDirty();
  }

  onReceiptTemplatesChange(data) {
    console.log('data', data);
    this.gridDataSource = data;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
