import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  formatRFC3339,
  endOfDay,
  endOfToday,
  subDays,
  startOfToday,
} from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-suppliers-history-transaction-popup',
  templateUrl: './suppliers-history-transaction-popup.component.html',
  styleUrls: ['./suppliers-history-transaction-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersHistoryTransactionPopupComponent
  implements OnInit, OnDestroy {
  form: FormGroup;
  // transactionDate = startOfToday();
  transactionDate: Date;
  endOfToday = endOfToday();
  minDate = subDays(startOfToday(), 30);
  item: any;
  paymentMethods = [
    {
      value: 1,
      label: 'ბარათით ანგარიშსწორება',
    },
    {
      value: 2,
      label: 'ნაღდი ანგარიშსწორება',
    },
  ];

  private unsubscribe$ = new Subject<void>();
  isDatePickerVisible: boolean;
  isSubmited: boolean;

  constructor(
    private dialogRef: MatDialogRef<SuppliersHistoryTransactionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private supplierId: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    private notificator: NotificationsService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.supplierId ? 'Edit Payment' : 'Add Payment'
    );
  }

  ngOnInit(): void {
    if (this.supplierId) {
      this.getItemForEdit();
    } else {
      this.createForm();
      this.onGenerateName();
    }
  }

  private createForm(): void {
    console.log(
      '🚀 ~ file: suppliers-history-transaction-popup.component.ts ~ line 76 ~ createForm ~  this.item',
      this.item
    );

    this.transactionDate = this.item && this.item.date;
    this.form = this.fb.group({
      name: [this.item && this.item.name, [Validators.required]],
      supplierId: [this.item && this.item.supplierId, [Validators.required]],
      paymentMethod: [
        this.item && this.item.paymentMethod,
        [Validators.required],
      ],
      amount: [
        this.item && this.item.transferAmount,
        [Validators.required, CustomValidators.MoreThan(0)],
      ],
      date: [this.item && this.item.date, [Validators.required]],
    });
    this.cdr.markForCheck();
  }

  private getItemForEdit(): void {
    this.client
      .get(`suppliers/balances/${this.supplierId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        if (!result) {
          this.dialogRef.close();
        }
        this.item = result;
        this.createForm();
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmited = true;
    const formData = this.form.getRawValue();
    let requestBody = {
      ...formData,
      transactionDate: formatRFC3339(Date.now()),
    };

    if (this.supplierId) {
      this.client
        .put('suppliers/balances', {
          id: this.supplierId,
          ...requestBody,
        })
        .pipe(
          catchError(() => {
            this.isSubmited = false;
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Edit Payment (Success)');
          this.notificator.saySuccess(
            this.translate.instant(
              'SUPPLIERS.TRANSACTIONS.UPDATE_SUCCESSFULLY_MESSAGE'
            )
          );
          this.dialogRef.close(true);
        });
    } else {
      this.client
        .post('suppliers/balances', {
          ...requestBody,
        })
        .pipe(
          catchError(() => {
            this.isSubmited = false;
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Add Payment (Success)');
          this.notificator.saySuccess(
            this.translate.instant(
              'SUPPLIERS.TRANSACTIONS.ADDED_SUCCESSFULLY_MESSAGE'
            )
          );
          this.dialogRef.close(true);
        });
    }
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  onInventorisationDateChange(date: any): void {
    if (
      !date ||
      new Date(date).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
    ) {
      date = formatRFC3339(Date.now());
    } else {
      date = endOfDay(date);
    }
    this.transactionDate = date;
    this.setValue('date', date);
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  onCancel(): void {
    this.dialogRef.close();
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

  onGenerateName(): void {
    if (this.form.controls?.name.disabled) {
      return;
    }
    let randomSufix = '';
    for (let i = 0; i < 8; i++) {
      randomSufix += Math.floor(Math.random() * 10);
    }
    this.form.controls.name.setValue(
      `${this.translate.instant('ანგარიშსწორება')}_${randomSufix}`
    );
    this.cdr.markForCheck();
  }

  get title(): string {
    return this.supplierId ? 'ანგარიშსწორების რედაქტირება' : 'ანგარიშსწორება';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
