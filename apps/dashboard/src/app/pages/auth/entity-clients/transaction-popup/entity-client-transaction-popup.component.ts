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
// tslint:disable-next-line:nx-enforce-module-boundaries
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339 } from 'date-fns';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-entity-client-transaction-popup',
  templateUrl: './entity-client-transaction-popup.component.html',
  styleUrls: ['./entity-client-transaction-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityClientTransactionPopupComponent
  implements OnInit, OnDestroy {
  form: FormGroup;
  paymentMethods = [
    { value: 'cash', label: 'ნაღდი ანგარიშსწორება' },
    { value: 'card', label: 'უნაღდო ანგარიშსწორება' },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<EntityClientTransactionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private entityClientId: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    private notificator: NotificationsService
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
      .post('entityclient/transactions', {
        ...formData,
        entityClientId: this.entityClientId,
        transactionDate: formatRFC3339(Date.now()),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess(
          'ENTITY_CLIENTS.TRANSACTIONS.SUCCESS_MESSAGE'
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
