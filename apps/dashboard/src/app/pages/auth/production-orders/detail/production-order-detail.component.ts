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
import { Subject, EMPTY, OperatorFunction, of } from 'rxjs';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';
import { ProductionOrderDetailProductsComponent } from './products/production-order-detail-products.component';
import { formatRFC3339 } from 'date-fns';
import { ClientService, RoutingStateService } from '@optimo/core';
import { ProductionOrderStatus } from 'apps/dashboard/src/app/core/enums/production-order-status.enum';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-production-order-detail',
  templateUrl: './production-order-detail.component.html',
  styleUrls: ['./production-order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionOrderDetailComponent implements OnInit, OnDestroy {
  @ViewChild(ProductionOrderDetailProductsComponent, { static: false })
  orderLinesComponent: ProductionOrderDetailProductsComponent;

  form: FormGroup;
  item: any;
  orderLines: any[];
  isSubmited: boolean;
  requestIsSent: boolean;
  // orderDate: Date;
  isDatePickerVisible: boolean;
  ProductionOrderStatus = ProductionOrderStatus;

  private editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ProductionOrderDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && +this.params.id ? 'Edit Preparation' : 'Add Preparation'
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
      .get(`stockitemproductionorders/${this.editId}`)
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
    // this.orderDate = this.item && this.item.orderDate;
    this.form = this.formBuilder.group({
      name: [this.item && this.item.name, [Validators.required]],
      // orderDate: [this.item && this.item.orderDate, [Validators.required]]
    });
    this.cdr.markForCheck();
  }

  createOrder(status: ProductionOrderStatus): void {
    console.log('TCL: EntitySalesDetailComponent -> this.form', this.form);
    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormGroupTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: this.editId,
      name: formRawValues.name,
      orderDate: formatRFC3339(new Date()),
      orderLines: this.orderLines
        .filter((item) => !!item)
        .map((item) => {
          return {
            stockItemReceiptId: item.stockItemReceiptId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            // isApproved: item.isApproved,
          };
        }),
    };

    const request = this.editId ? this.client.put : this.client.post;

    this.requestIsSent = true;

    this.cdr.markForCheck();
    request
      .bind(this.client)('stockitemproductionorders', requestBody)
      .pipe(this.toHttpfinish(status), takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this._mixpanelService.track(
            this.editId ? 'Edit Recipe (Success)' : 'Add Recipe (Success)'
          );
          this.close();
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  private toHttpfinish(
    status: ProductionOrderStatus
  ): OperatorFunction<any, any> {
    return switchMap((result) => {
      const id = (result && result.id) || this.editId;
      if (status === ProductionOrderStatus.Succeeded && id) {
        const data = {
          id,
        };
        return this.client.put('stockitemproductionorders/finish', data);
      }
      return of(null);
    });
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
      this.routingState.getPreviousUrlTree() || '/production-orders'
    );
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.orderLinesComponent) {
      this.orderLinesComponent.markFormGroupTouched();
    }
  }

  get title(): string {
    return this.editId
      ? 'ProductionOrders.ITEM.edit'
      : 'ProductionOrders.ITEM.add';
  }

  get isFormInvalid(): boolean {
    return (
      this.form.invalid ||
      !this.orderLines ||
      !this.orderLines.length ||
      this.orderLines
        .filter((item) => !!item)
        .some((item) => {
          return !item.quantity;
        })
    );
  }

  // onOrderDateChange(date: Date): void {
  //   if (!date) {
  //     date = new Date();
  //   }
  //   date = endOfDay(date);
  //   this.orderDate = date;
  //   this.setValue('orderDate', date);

  //   this.onToggleDatePicker();
  // }

  // onToggleDatePicker(): void {
  //   this.isDatePickerVisible = !this.isDatePickerVisible;
  //   this.cdr.markForCheck();
  // }

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
