import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { StockItemTransactionType } from 'apps/dashboard/src/app/core/enums/stockitem-transaction-type.enum';
import { mapOfHoldingTypes } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { valueToRelative } from '@amcharts/amcharts4/.internal/core/utils/Utils';
import { CustomValidators } from '../../core/helpers/validators/validators.helper';

@Component({
  selector: 'app-supplies-change-popup',
  templateUrl: './supplies-change-popup.component.html',
  styleUrls: ['./supplies-change-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliesChangePopupComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  suppliesForm: FormGroup;
  private currentQuantity: number;
  suppliesChangeTypes = [
    { value: StockItemTransactionType.StocktakePlus, label: 'ნამატი' },
    { value: StockItemTransactionType.Damage, label: 'დაზიანება' },
    { value: StockItemTransactionType.Loss, label: 'დაკარგვა' },
    { value: StockItemTransactionType.Steal, label: 'მოპარვა' },
    { value: StockItemTransactionType.StocktakeMinus, label: 'ზარალი' },
  ];

  mapOfHoldingTypes = mapOfHoldingTypes;

  constructor(
    private dialogRef: MatDialogRef<SuppliesChangePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentQuantity = this.data.item.quantity;
    this.createForm();
  }

  private createForm(): void {
    this.suppliesForm = this.fb.group(
      {
        reason: [null, [Validators.required]],
        supplies: [null, [Validators.required, CustomValidators.MoreThan(0)]],
      },
      {
        validators: [this.supplyAmountValidation],
      }
    );
    this.cdr.markForCheck();
  }

  supplyAmountValidation: ValidatorFn = (
    group: FormGroup
  ): ValidationErrors | null => {
    if (!(group.controls.reason && group.controls.supplies)) {
      console.error(
        'mulformed form group provided, form group does not contain "reason" or "supplies"',
        group
      );
      return null;
    }

    const reason = group.controls.reason.value;
    const supplies = group.controls.supplies.value;

    if (reason && reason !== StockItemTransactionType.StocktakePlus) {
      if (this.currentQuantity < supplies) {
        group.controls.supplies.setErrors({
          moreLossThanCurrentAmount: {
            currentSupply: this.currentQuantity,
            reducedBy: supplies,
          },
        });
        return {
          moreLossThanCurrentAmount: {
            currentSupply: this.currentQuantity,
            reducedBy: supplies,
          },
        };
      }
    }

    return null;
  };

  onSubmit(): void {
    if (this.suppliesForm.invalid) {
      return;
    }

    this.dialogRef.close(this.suppliesForm.getRawValue());
  }

  get description(): string {
    const supplies = this.getValue('supplies');
    const reason = this.getValue('reason');

    if (!supplies || supplies < 0) {
      return this.currentQuantity.toString();
    }

    if (reason === StockItemTransactionType.StocktakePlus) {
      return `${this.currentQuantity} + ${supplies} = ${
        this.currentQuantity + Number(supplies)
      }`;
    }

    return supplies < this.currentQuantity
      ? `${this.currentQuantity} - ${supplies} = ${
          this.currentQuantity - Number(supplies)
        }`
      : '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getValue(controlName: string): any {
    return this.suppliesForm.controls[controlName].value;
  }

  setValue(controlName: string, value: any): void {
    this.suppliesForm.controls[controlName].setValue(value);
    this.suppliesForm.controls[controlName].markAsDirty();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
