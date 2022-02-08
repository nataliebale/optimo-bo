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
import { Subject } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339 } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-suppliers-transaction-popup',
  templateUrl: './suppliers-transaction-popup.component.html',
  styleUrls: ['./suppliers-transaction-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersTransactionPopupComponent implements OnInit, OnDestroy {
  form: FormGroup;
  paymentMethods = [
    {
      value: 'cash',
      // label: this.translate.instant('SUPPLIERS.TRANSATIONS.CASH'),
      label: 'ნაღდი ანგარიშსწორება',
    },
    {
      value: 'card',
      // label: this.translate.instant('SUPPLIERS.TRANSATIONS.CARD'),
      label: 'ბარათით ანგარიშსწორება',
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<SuppliersTransactionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private supplierId: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    private notificator: NotificationsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.form = this.fb.group({
      paymentMethod: ['cash', [Validators.required]],
      transactionAmount: [0, [Validators.required, Validators.min(0)]],
    });
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.getRawValue();

    this.client
      .post('suppliers/transactions', {
        ...formData,
        supplierId: this.supplierId,
        transactionDate: formatRFC3339(Date.now()),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess(
          this.translate.instant('SUPPLIERS.TRANSACTIONS.SUCCESS_MESSAGE')
        );
        this.dialogRef.close(true);
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
