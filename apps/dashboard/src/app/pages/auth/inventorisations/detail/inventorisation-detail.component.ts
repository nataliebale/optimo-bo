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
import { Subject, EMPTY } from 'rxjs';
import { ClientService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil, catchError } from 'rxjs/operators';
import { InventorisationDetailListComponent } from './list/inventorisation-detail-list.component';
import {
  MAP_OF_INVENTORISATION_TYPES,
  InventorisationType,
} from 'apps/dashboard/src/app/core/enums/inventorisation-type.enum';
import { endOfDay, formatRFC3339 } from 'date-fns';
import {
  MAP_OF_INVENTORISATION_CRITERIAS,
  InventorisationCriteria,
} from 'apps/dashboard/src/app/core/enums/inventorisation-criteria.enum';
import { InventorisationStatus } from 'apps/dashboard/src/app/core/enums/inventorisation-status.enum';
import { RoutingStateService } from '@optimo/core';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-inventorisation-detail',
  templateUrl: './inventorisation-detail.component.html',
  styleUrls: ['./inventorisation-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorisationDetailComponent implements OnInit, OnDestroy {
  @ViewChild(InventorisationDetailListComponent)
  criteriaListComponent: InventorisationDetailListComponent;

  form: FormGroup;
  item: any;
  criteriaValues: any[];
  isSubmited: boolean;
  requestIsSent: boolean;
  inventorisationDate: Date;
  isDatePickerVisible: boolean;
  InventorisationType = InventorisationType;
  InventorisationStatus = InventorisationStatus;
  mapOfInventorisationTypes = MAP_OF_INVENTORISATION_TYPES;
  mapOfInventorisationCriterias = MAP_OF_INVENTORISATION_CRITERIAS;

  private editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<InventorisationDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && this.params.id ? 'Edit Stock Take' : 'Add Stock Take'
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
      .get(`stocktakeorders/${this.editId}`)
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

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  private createForm(): void {
    this.inventorisationDate = this.item && this.item.orderDate;
    this.form = this.formBuilder.group({
      name: [this.item && this.item.name, [Validators.required]],
      orderDate: [this.item && this.item.orderDate, [Validators.required]],
      type: [
        (this.item && this.item.type) || InventorisationType.Partial,
        [Validators.required],
      ],
      criteria: [
        (this.item && this.item.criteria) || InventorisationCriteria.Category,
        [Validators.required],
      ],
    });
    this.cdr.markForCheck();
  }

  onSave(): void {
    console.log('TCL: EntitySalesDetailComponent -> this.form', this.form);
    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormGroupTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: this.editId,
      ...formRawValues,
      orderDate: formatRFC3339(new Date(formRawValues.orderDate)),
      criteria:
        formRawValues.type === InventorisationType.Partial
          ? formRawValues.criteria
          : null,
      criteriaValues: this.criteriaValues,
    };

    const request = this.editId ? this.client.put : this.client.post;

    this.requestIsSent = true;

    this.cdr.markForCheck();
    request
      .bind(this.client)('stocktakeorders', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.close();
          this._mixpanelService.track(
            this.editId
              ? 'Edit Stock Take (Success)'
              : 'Add Stock Take (Success)'
          );
          console.log(
            this.editId
              ? 'Edit Stock Take (Success)'
              : 'Add Stock Take (Success)'
          );
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  onTypeChange(): void {
    if (this.getValue('type') === InventorisationType.Partial) {
      this.form.controls.criteria.enable();
      this.setValue('criteria', InventorisationCriteria.Category);
    } else {
      this.form.controls.criteria.disable();
      this.setValue('criteria', null);
    }
  }

  onCancel(): void {
    if (this.form.dirty) {
      this.showCancelDialog();
    } else {
      this.close();
    }
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

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/inventorisations'
    );
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.criteriaListComponent) {
      this.criteriaListComponent.markFormGroupTouched();
    }
  }

  get title(): string {
    return this.editId
      ? 'Inventorisations.Item.Details.editInventorisation'
      : 'Inventorisations.Item.Details.addInventorisation';
  }

  get criteriasTitle(): string {
    switch (this.getValue('criteria')) {
      case InventorisationCriteria.Category:
        return 'addCategory';
      case InventorisationCriteria.StockItem:
        return 'addProduct';
      case InventorisationCriteria.Supplier:
        return 'addSupplier';
    }
  }

  get isFormInvalid(): boolean {
    return (
      this.form.invalid ||
      (this.getValue('type') === InventorisationType.Partial &&
        (!this.criteriaListComponent || !this.criteriaValues.length))
    );
  }

  onInventorisationDateChange(date: Date): void {
    if (!date) {
      date = new Date();
    }
    date = endOfDay(date);
    this.inventorisationDate = date;
    this.setValue('orderDate', date);
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
