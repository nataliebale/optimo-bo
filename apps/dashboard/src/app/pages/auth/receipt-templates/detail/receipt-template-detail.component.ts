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
import { ClientService, RoutingStateService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil, catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { VATTypes } from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { mapOfMeasurementUnits } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { SuppliesChangePopupComponent } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.component';
import { StockItemTransactionType } from 'apps/dashboard/src/app/core/enums/stockitem-transaction-type.enum';
import { HoldingType } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { EditModes } from 'apps/dashboard/src/app/core/enums/edit-modes.enum';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-receipt-template-detail',
  templateUrl: './receipt-template-detail.component.html',
  styleUrls: ['./receipt-template-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptTemplateDetailComponent implements OnInit, OnDestroy {
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

  private suppliesChangeData: {
    reason: number;
    supplies: number;
    holdingType: HoldingType;
  };

  editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ReceiptTemplateDetailComponent>,
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
      this.params && +this.params.id
        ? 'Edit Recipe Template'
        : 'Add Recipe Template'
    );
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

  private getItemForEdit(): void {
    this.client
      .get<any>(`stockitemreceipttemplate/${this.editId}`) // todo:
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
    this.form = this.formBuilder.group({
      name: [this.item && this.item.name, [Validators.required]],
      description: [this.item && this.item.description],
      unitOfMeasurement: [
        {
          value: this.item && this.item.unitOfMeasurement,
          disabled: this.editId,
        },
        [Validators.required],
      ],
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
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    let requestBody = this.form.getRawValue();

    requestBody.templateItems = this.gridDataSource.map((item) => ({
      stockItemId: item.id,
      quantity: item.usedQuantity,
    }));

    const neededRequest = this.getNeededRequest(requestBody);
    this.requestIsSent = true;
    neededRequest.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this._mixpanelService.track(
          this.editId
            ? 'Edit Preparation (Success)'
            : 'Add Preparation (Success)'
        );
        this.close();
      },
      error: () => {
        this.requestIsSent = false;
        this.cdr.markForCheck();
      },
    });

    this.requestIsSent = true;
    this.cdr.markForCheck();
  }

  private getNeededRequest(requestBody: object): Observable<any> {
    if (this.editId) {
      return this.client.put<any>('stockitemreceipttemplate', {
        ...requestBody,
        id: this.editId,
      });
    }

    return this.client.post<any>('stockitemreceipttemplate', requestBody);
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
    return this.form.get(path).dirty;
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/receipt-templates'
    );
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    console.log(
      '345345345345',
      this.ingredientsListComponent.markFormGroupTouched()
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
    return this.form.get(path).value;
  }

  get title(): string {
    return this.editId ? 'ReceiptTemlates.edit' : 'ReceiptTemlates.add';
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
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
    this.form.get([groupName, controlName]).setValue(value);
    this.form.get([groupName, controlName]).markAsDirty();
  }

  onReceiptTemplatesChange(data) {
    this.gridDataSource = data;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
