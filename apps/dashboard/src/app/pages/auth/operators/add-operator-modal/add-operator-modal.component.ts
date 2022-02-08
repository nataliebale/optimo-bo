import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, StorageService } from '@optimo/core';
import { takeUntil, catchError } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

export enum OperatorPermission {
  CanReceivePurchaseOrders = 'canReceivePurchaseOrders',
  CanSetDiscount = 'canSetDiscount',
  CanChangePrice = 'canChangePrice',
  CanDeleteFromBasket = 'canDeleteFromBasket',
  CanDeleteBasket = 'canDeleteBasket',
  CanSeeAllOrders = 'canSeeAllOrders',
  CanOrder = 'canOrder',
  CanOpenShift = 'canOpenShift',
  CanSeeShiftSums = 'canSeeShiftSums',
  CanWithdrawCash = 'canWithdrawCash',
  CanReturnOrder = 'canReturnOrder',
}

@Component({
  selector: 'app-add-operator-modal',
  templateUrl: './add-operator-modal.component.html',
  styleUrls: ['./add-operator-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOperatorModalComponent implements OnInit, OnDestroy {
  operatorForm: FormGroup;
  customPattern = { Z: { pattern: new RegExp('[0-9]|\\*') } };
  private editItem: any;
  private unsubscribe$ = new Subject<void>();
  requestIsSent: boolean;

  permissionsMap = [
    {
      value: OperatorPermission.CanReceivePurchaseOrders,
      label:
        this.translate.instant(
          'OPERATORS.PERMISSION_VALUES.CanReceivePurchaseOrders'
        ) || 'შესყიდვის ნახვა',
    },
    {
      value: OperatorPermission.CanSetDiscount,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanSetDiscount') ||
        'ფასდაკლება',
    },
    {
      value: OperatorPermission.CanChangePrice,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanChangePrice') ||
        'ფასის ცვლილება',
    },
    {
      value: OperatorPermission.CanDeleteFromBasket,
      label:
        this.translate.instant(
          'OPERATORS.PERMISSION_VALUES.CanDeleteFromBasket'
        ) || 'პროდუქტის შეკვეთიდან წაშლა',
    },
    {
      value: OperatorPermission.CanDeleteBasket,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanDeleteBasket') ||
        'შეკვეთის წაშლა',
    },
    {
      value: OperatorPermission.CanSeeAllOrders,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanSeeAllOrders') ||
        'შეკვეთის ნახვა, შეცვლა',
    },
    {
      value: OperatorPermission.CanOrder,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanOrder') ||
        'გადახდა',
    },
    {
      value: OperatorPermission.CanOpenShift,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanOpenShift') ||
        'ცვლის გახსნა და დახურვა',
    },
    {
      value: OperatorPermission.CanSeeShiftSums,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanSeeShiftSums') ||
        'ნავაჭრის ნახვა',
    },
    {
      value: OperatorPermission.CanWithdrawCash,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanWithdrawCash') ||
        'თანხის გაცემა',
    },
    {
      value: OperatorPermission.CanReturnOrder,
      label:
        this.translate.instant('OPERATORS.PERMISSION_VALUES.CanReturnOrder') ||
        'უკან დაბრუნება',
    },
  ];
  public isHorecaMode = this._storageService.isHorecaMode;
  constructor(
    private dialogRef: MatDialogRef<AddOperatorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    private _storageService: StorageService,
    private _mixpanelService: MixpanelService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    console.log('TCL: AddOperatorModalComponent -> this.data', this.data);
    if (this.data) {
      this.getEditData();
    } else {
      this.createForm();
    }
  }

  private getEditData(): void {
    this.client
      .get('operators/' + this.data)
      .pipe(
        catchError(() => {
          this.onClose();
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        if (result) {
          this.editItem = result;
          this.createForm();
        } else {
          this.onClose();
        }
      });
  }

  private createForm(): void {
    this.operatorForm = this.fb.group({
      name: [this.editItem && this.editItem.name, Validators.required],
      permissions: [
        this.editItem && this.getActivePermitions(this.editItem.permissions),
      ],
      pinCode: [
        this.editItem ? '****' : '',
        [Validators.required, Validators.maxLength(4), Validators.minLength(4)],
      ],
    });
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.operatorForm.invalid) {
      return;
    }
    const { permissions, ...formData } = this.operatorForm.getRawValue();
    const data = {
      id: this.editItem && this.editItem.id,
      ...formData,
      permissions: this.parsePermissions(permissions || []),
      pinCode: formData.pinCode === '****' ? undefined : formData.pinCode,
    };

    const request = this.data ? this.client.put : this.client.post;

    console.log('operator permissions data: ', data);
    this.requestIsSent = true;
    request
      .bind(this.client)('operators', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: any) => {
          this._mixpanelService.track(
            this.data ? 'Edit Employee (Success)' : 'Add Employee (Success)'
          );
          this.dialogRef.close((result && result.id) || true);
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  generateAndWritePincode(e: Event): void {
    e.stopPropagation();
    this.setValue('pinCode', this.generateCode());
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private generateCode(): string {
    return 'xxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line: no-bitwise
      const r = (Math.random() * 10) | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(10);
    });
  }

  onInputTypeNumberClick(): void {
    if (this.getValue('pinCode') === '****') {
      this.setValue('pinCode', '');
    }
  }

  private getValue(controlName) {
    return this.operatorForm.controls[controlName].value;
  }

  private setValue(controlName = '', value = null) {
    this.operatorForm.controls[controlName].setValue(value);
    this.operatorForm.controls[controlName].markAsDirty();
  }

  private parsePermissions(permissions: string[]): object {
    const permitionsPayload = {
      [OperatorPermission.CanReceivePurchaseOrders]: false,
      [OperatorPermission.CanSetDiscount]: false,
      [OperatorPermission.CanChangePrice]: false,
      [OperatorPermission.CanDeleteFromBasket]: false,
      [OperatorPermission.CanDeleteBasket]: false,
      [OperatorPermission.CanSeeAllOrders]: false,
      [OperatorPermission.CanOrder]: false,
      [OperatorPermission.CanOpenShift]: false,
      [OperatorPermission.CanSeeShiftSums]: false,
      [OperatorPermission.CanWithdrawCash]: false,
      [OperatorPermission.CanReturnOrder]: false,
    };
    permissions.forEach((permission) => {
      permitionsPayload[permission] = true;
    });
    return permitionsPayload;
  }

  private getActivePermitions(permitions: {}): string[] {
    const activePermitions: string[] = [];
    const keys = Object.keys(permitions);
    keys.forEach((key) => {
      if (permitions[key] === true) {
        activePermitions.push(key);
      }
    });
    return activePermitions;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
