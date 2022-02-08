import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { endOfDay, formatRFC3339 } from 'date-fns';
import { mapOfPaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-received-waybill-edit-new-order',
  templateUrl: './received-waybill-edit-new-order.component.html',
  styleUrls: ['./received-waybill-edit-new-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivedWaybillEditNewOrderComponent implements OnInit, OnDestroy {
  form: FormGroup;
  expectedReceiveDate: Date;
  isDatePickerVisible: boolean;
  paymentMethods = mapOfPaymentMethods;
  private unsubscribe$ = new Subject<void>();
  requestIsSent: boolean;

  constructor(
    private dialogRef: MatDialogRef<ReceivedWaybillEditNewOrderComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private router: Router,
    private fb: FormBuilder,
    private _mixpanelService: MixpanelService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    const { purchaseOrder, waybillData } = this.data;
    this.expectedReceiveDate = endOfDay(
      purchaseOrder?.expectedReceiveDate
        ? new Date(purchaseOrder.expectedReceiveDate)
        : new Date()
    );
    this.form = this.fb.group({
      name: [
        (purchaseOrder && purchaseOrder.name) || waybillData.waybillNumber,
        [Validators.required],
      ],
      expectedReceiveDate: [this.expectedReceiveDate, [Validators.required]],
      paymentMethod: [
        purchaseOrder && purchaseOrder.paymentMethod,
        [Validators.required],
      ],
    });
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }
    this.requestIsSent = true;
    this.matchSupplier();
    this.matchStockitems();
    this.savePurchaseOrder();
    this._mixpanelService.track('Add to Stock', {
      method: 'Waybill'
    });
  }

  private matchSupplier(): void {
    const requestBody = {
      supplierId: this.data.supplierId,
      externalSupplierINN: this.data.waybillData.sellerTIN,
    };

    this.client
      .post('waybills/supplier', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  private matchStockitems(): void {
    const requestBody = {
      stockItems: this.data.productsDataSource
        .filter((item) => item.stockItemId)
        .map((item) => ({
          supplierId: this.data.supplierId,
          stockItemId: item.stockItemId,
          externalStockItemBarcode: item.wbSKU,
        })),
    };

    this.client
      .post('waybills/stockitem', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  private savePurchaseOrder(): void {
    const formData = this.form.getRawValue();
    const requestBody = {
      id: this.data.purchaseOrder && this.data.purchaseOrder.id,
      supplierId: this.data.supplierId,
      paymentMethod: formData.paymentMethod,
      name: formData.name,
      waybillNumber: this.data.waybillData.waybillNumber,
      expectedReceiveDate: formatRFC3339(formData.expectedReceiveDate),
      receiveDate: this.markAsReceived
        ? formatRFC3339(
            this.data.waybillData.deliveryDate
              ? new Date(this.data.waybillData.deliveryDate)
              : new Date()
          )
        : null,
      orderLines: this.data.productsDataSource
        .filter((item) => item.stockItemId)
        .map((item) => {
          const orderLine =
            this.data.purchaseOrder &&
            this.data.purchaseOrder.orderLines.find(
              (o) => o.id === item.orderLineId
            );
          return {
            id: item.orderLineId,
            stockItemId: item.stockItemId,
            orderedQuantity:
              (this.markAsReceived && orderLine && orderLine.orderedQuantity) ||
              item.poQuantity,
            expectedUnitCost:
              (this.markAsReceived &&
                orderLine &&
                orderLine.expectedUnitCost) ||
              item.poUnitCost,
            receivedQuantity: this.markAsReceived ? item.poQuantity : null,
            receivedUnitCost: this.markAsReceived ? item.poUnitCost : null,
            unitPrice: item.stockItemIsIngredient ? 0.1 : item.poUnitPrice, // 0.1 is dummy number for falidation hack
          };
        }),
    };

    this.client
      .post('purchaseorders/waybill', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => this.navigateToList(),
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  onExpectedReceiveDateChange(date: Date): void {
    if (!date) {
      date = new Date();
    }
    date = endOfDay(date);
    this.expectedReceiveDate = date;
    this.setValue('expectedReceiveDate', date);

    this.onToggleDatePicker();
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  private navigateToList(): void {
    this.router.navigate(['/rs/waybills']);
    this.dialogRef.close();
  }

  private get markAsReceived(): boolean {
    return this.data.status === 'received';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
