import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { OrderStatuses } from 'apps/dashboard/src/app/core/enums/order-status.enum';
import { EditModes } from '../../../../core/enums/edit-modes.enum';
import {
  ApproveDialogComponent,
  approveAction,
} from '@optimo/ui-popups-approve-dialog';
import { Observable, Subject, EMPTY, OperatorFunction, of, zip } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ClientService, Service } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { startOfToday, formatRFC3339, endOfDay } from 'date-fns';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { mapOfPaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import {
  takeUntil,
  catchError,
  switchMap,
  map,
  tap,
  filter,
} from 'rxjs/operators';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { AddOrderLinesComponent } from './add-order-lines/add-order-lines.component';
import { RoutingStateService } from '@optimo/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { ISelectedFile } from './order-lines-excel-import/order-lines-excel-import.component';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'app-add-order',
  templateUrl: './add-order.component.html',
  styleUrls: ['./add-order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddOrderComponent implements OnInit, OnDestroy {
  @ViewChild(AddOrderLinesComponent)
  orderLinesComponent: AddOrderLinesComponent;

  form: FormGroup;
  item: any;

  paymentMethods = mapOfPaymentMethods;
  editMode = EditModes.Default;
  editModes = EditModes;
  orderStatuses = OrderStatuses;

  private defaultDate = startOfToday();
  receiveDate: Date;
  maxDate = new Date(2029, 11, 31);
  isDatePickerVisible: boolean;

  orderLines: any[];

  private editId: number;
  private unsubscribe$ = new Subject<void>();
  isSubmited: boolean;
  requestIsSent: boolean;
  lastSupplierId: number;

  private errorMessages = {
    receiveDate: 'შეიყვანეთ მომავალი თარიღი',
  };

  // this saves order Id when exec submit is used
  orderId: number;
  // this is needed to display save continue button in excel mode.
  orderSaved: boolean;

  clearSelection = new EventEmitter<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddOrderComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private notifier: NotificationsService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && +this.params.id ? 'Edit Purchase' : 'Add Purchase'
    );
  }

  ngOnInit(): void {
    this.editMode = (this.params && +this.params.mode) || EditModes.Default;
    if (this.editMode === EditModes.Receive) {
      this.maxDate = new Date();
    }

    this.editId = this.params && +this.params.id;
    if (this.editId && this.editMode !== EditModes.Duplicate)
      this.orderId = this.editId;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
      this.generateName();
    }

    this.errorMessages.receiveDate = this.translate.instant(
      'ORDERS.ITEM.DETAILS.ENTER_FUTURE_DATE'
    );
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
  }

  private getItemForEdit(): void {
    // this.client
    //   .get<any>(`purchaseorders/${this.editId}`)
    //   .pipe(
    //     catchError(() => {
    //       return EMPTY;
    //     }),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe((result) => {
    //     if (!result) {
    //       this.close();
    //     }
    //     this.item = result;
    //     this.createForm();
    //   });

    zip(this.getPurchaseOrderRequest(), this.getOrderLinesRequest())
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
        // console.log('dev => getItemForEdit result:', result);
        this.item = result[0];
        this.item.orderLines = result[1];
        this.createForm();
      });
  }

  private getPurchaseOrderRequest(): Observable<any> {
    return this.client.get<any>(`purchaseorders/${this.editId}`);
  }

  private getOrderLinesRequest(): Observable<any> {
    return this.client.get(`purchaseorders/orderlines/${this.editId}`, {
      params: new HttpParams({
        fromObject: {
          skip: '0',
          take: '9999',
        },
      }),
      service: Service.Main,
    });
  }

  private generateName(): void {
    let randomSufix = '';
    for (let i = 0; i < 8; i++) {
      randomSufix += Math.floor(Math.random() * 10);
    }
    this.form.controls.name.setValue(
      `${this.translate.instant(
        'ORDERS.ITEM.DETAILS.ORDER_GENERATED_NAME_PREFIX'
      )}_${randomSufix}`
    );
  }

  private createForm(): void {
    this.receiveDate =
      this.item?.expectedReceiveDate &&
      new Date(this.item?.expectedReceiveDate);
    this.lastSupplierId = this.item?.supplierId;
    this.form = this.formBuilder.group({
      supplierId: [this.item && this.item.supplierId, [Validators.required]],
      name: [this.item && this.item.name, [Validators.required]],
      receiveDate: [this.receiveDate, [Validators.required]],
      paymentMethod: [
        {
          value: this.item && this.item.paymentMethod,
          disabled: false,
        },
        [Validators.required],
      ],
      excelUpload: [this?.item?.isExcel],
    });

    if (this?.item?.isExcel) {
      this.transformFormGroupForExcel();
      this.addControlForFileInput({
        fileName: this?.item?.importedFileName,
        fileId: this?.item?.importedFileId,
        fileUrl: this?.item?.importedFileUrl,
      });
      this.setInputsDisabled(true);
      this.orderSaved = true;
    } else {
      this.transformFormGroupForManualInput();
    }

    this.form.controls?.excelUpload.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((checkboxVal) => {
        console.log(checkboxVal);
        if (this.item) this.item.orderLines = [];
        if (checkboxVal) {
          this.transformFormGroupForExcel();
        } else {
          this.transformFormGroupForManualInput();
          this.setInputsDisabled(false);
          this.orderSaved = false;
        }
      });

    this.cdr.markForCheck();
  }

  // disables or enables general data inputs
  private setInputsDisabled(disabledState: boolean) {
    const controls = [
      this.form.controls.supplierId,
      this.form.controls.name,
      this.form.controls.receiveDate,
      this.form.controls.paymentMethod,
    ];
    if (disabledState) {
      controls.forEach((control) => control.disable());
    } else {
      controls.forEach((control) => control.enable());
    }
  }

  private transformFormGroupForExcel() {
    // console.log('dev => switching to excel', this.form);
    if (!this.form) {
      console.error('FormGroup not present!');
      return;
    }
    this.form.removeControl('orderLines');
  }

  private addControlForFileInput(defaultValue?: ISelectedFile) {
    // console.log('dev => add fileInput control form file upload', this.form);
    if (!this.form) {
      console.error('FormGroup not present!');
      return;
    }
    this.form.addControl('selectedFile', new FormControl(defaultValue || null));
  }

  private transformFormGroupForManualInput() {
    // console.log('dev => switching to manual', this.form);
    if (!this.form) {
      console.error('FormGroup not present!');
      return;
    }
    this.form.removeControl('selectedFile');
    this.form.addControl(
      'orderLines',
      new FormArray([], [this.requiredNotEmpty])
    );
  }

  requiredNotEmpty = (control: FormControl): ValidationErrors => {
    // console.log('dev => requiredNotEmpty => validate value', control.value);
    const errors =
      control?.value && control?.value?.length === 0
        ? {
            arrayIsEmpty: true,
          }
        : null;
    // console.log('dev => requiredNotEmpty => errors', errors);
    return errors;
  };

  onChangeSupplier(value: any): void {
    if (value) {
      if (
        this.editId &&
        this.orderLines &&
        this.orderLines.length &&
        this.lastSupplierId !== value.id
      ) {
        this.showChangeSupplierDialog(value.id);
        return;
      }
      this.setSupplierId(value.id);
    }
  }

  private showChangeSupplierDialog(supplierId: number): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'ORDERS.ITEM.DETAILS.SUPPLIER_CHANGE_DIALOG_TITLE',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result) {
          this.setValue('supplierId', this.lastSupplierId);
          return;
        }

        this.setSupplierId(supplierId);
      });
  }

  private setSupplierId(supplierId: number): void {
    this.lastSupplierId = supplierId;
    this.clearSelection.next();
  }

  private trackAddToStock(withExcel = false) {
    this._mixpanelService.track('Add to Stock', {
      method: withExcel ? 'Import' : 'Purchase Order',
    });
  }

  receiveOrderExcel(): void {
    console.log('dev => receiveOrderExcel');

    approveAction(this.dialog, {
      title: 'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.TITLE',
      approveBtnLabel:
        'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.APPROVE_LABEL',
      denyBtnLabel: 'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.DENY_LABEL',
    })
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((res) => res === true),
        tap((_) => this.markRequestSent(true)),
        tap((_) => this.markFormSumitted()),
        switchMap((_) => this.makeOrderRequest(this.orderId)),
        switchMap((_) => this.receiveOrderRequest(this.orderId, true)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        console.log('dev => purchaseorders/receive res:', res);
        if (res) {
          // this.notifier.saySuccess('შეკვეთა მიღებულია');
          this.close();
        }
      });
  }

  markRequestSent(isSent: boolean): void {
    this.requestIsSent = isSent;
    this.cdr.markForCheck();
  }

  markFormSumitted(): void {
    this.isSubmited = true;
  }

  saveOrderExcel(): void {
    console.log('dev => saveOrderExcel');

    if (this.isFormInvalid) {
      this.markFormSumitted();
      this.markFormGroupTouched();
      return;
    }

    of('saveOrderExcel')
      .pipe(
        tap((_) => this.markRequestSent(true)),
        takeUntil(this.unsubscribe$),
        switchMap((_) => this.saveOrderRequest(this.orderId, true)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        // this._mixpanelService.track(
        //   this.editId ? 'Edit Purchase (Success)' : 'Add Purchase (Success)'
        // );
        console.log('saveOrderExcel res:', res);
        // this.notifier.saySuccess('შენახვა წარმატებით შეინახა');
        this.close();
      });
  }

  receiveOrder(): void {
    // const formRawValues = this.form.getRawValue();

    // const requestBody = {
    //   id: this.editId,
    //   receiveDate: formatRFC3339(formRawValues.receiveDate),
    //   // isApproved: formRawValues.isApproved ? true : false,
    //   orderLines: formRawValues.orderLines
    //     .filter((item) => !!item)
    //     .map((item) => {
    //       return {
    //         id: item.orderLineId,
    //         receivedQuantity: item.orderedQuantity,
    //         receivedUnitCost: item.unitCost,
    //       };
    //     }),
    // };

    // this.requestIsSent = true;
    // this.client
    //   .put<any>(`purchaseorders/receive`, requestBody)
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe({
    //     next: this.close.bind(this),
    //     error: () => {
    //       this.requestIsSent = false;
    //       this.cdr.markForCheck();
    //     },
    //   });

    if (this.isFormInvalid) {
      this.markFormSumitted();
      this.markFormGroupTouched();
      console.log(
        'dev => AddOrderComponent => receiveOrder => this.form is invalid',
        this.form
      );
      return;
    }

    approveAction(this.dialog, {
      title: 'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.TITLE',
      approveBtnLabel:
        'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.APPROVE_LABEL',
      denyBtnLabel: 'ORDERS.ITEM.DETAILS.APPROVE_RECEIVE_DIALOG.DENY_LABEL',
    })
      .pipe(
        filter((res) => {
          // console.log('dev => approve result => res:', res);
          return res === true;
        }),
        tap((_) => this.markRequestSent(true)),
        takeUntil(this.unsubscribe$),
        switchMap((_) => this.receiveOrderRequest(this.orderId)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        console.log('dev -> AddOrderComponent => saveOrder res:', res);
        if (res) {
          this.cdr.markForCheck();
          // this.notifier.saySuccess('შეკვეთა მიღებულია');
          this.close();
        }
      });
  }

  saveOrder(): void {
    console.log(
      'dev => AddOrderComponent => saveOrder => this.form',
      this.form
    );
    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormSumitted();
      this.markFormGroupTouched(true);
      console.log(
        'dev => AddOrderComponent => saveOrder => this.form is invalid',
        this.form
      );
      return;
    }

    of('saveOrder')
      .pipe(
        tap((_) => this.markRequestSent(true)),
        takeUntil(this.unsubscribe$),
        switchMap((_) => this.saveOrderRequest(this.orderId)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        console.log('dev -> AddOrderComponent => saveOrder res:', res);
        if (res?.id) {
          this._mixpanelService.track(
            this.editId ? 'Edit Purchase (Success)' : 'Add Purchase (Success)'
          );
          this.cdr.markForCheck();
          // this.notifier.saySuccess(res?.updated ? 'შეკვეთა შეინახა' : 'შეკვეთა წარმატებით შეიქმნა');
          this.close();
        }
      });
  }

  makeOrder(): void {
    console.log(
      'dev => AddOrderComponent => saveOrder => this.form',
      this.form
    );
    // this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormSumitted();
      this.markFormGroupTouched();
      console.log(
        'dev => AddOrderComponent => saveOrder => this.form is invalid',
        this.form
      );
      return;
    }

    of('makeOrder')
      .pipe(
        tap((_) => this.markRequestSent(true)),
        takeUntil(this.unsubscribe$),
        switchMap((_) => this.saveOrderRequest(this.orderId)),
        switchMap((res) => this.makeOrderRequest(res.id)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        this._mixpanelService.track('Add Purchase (Success)');
        console.log('dev -> AddOrderComponent => makeOrder res:', res);
        if (res) {
          this.cdr.markForCheck();
          // this.notifier.saySuccess('შეკვეთა წარმატებით შეიკვეთა');
          this.close();
        }
      });
  }

  // createOrder(status: OrderStatuses, withOrderLines = true): void {
  //   console.log('TCL: AddOrderComponent -> this.form', this.form);
  //   this.isSubmited = true;
  //   if (this.isFormInvalid) {
  //     this.markFormSumitted();
  //     this.markFormGroupTouched(withOrderLines);
  //     console.log(222222222);
  //     return;
  //   }

  //   const formRawValues = this.form.getRawValue();

  //   const requestBody = {
  //     id: this.editId,
  //     supplierId: formRawValues.supplierId,
  //     paymentMethod: formRawValues.paymentMethod,
  //     name: formRawValues.name,
  //     expectedReceiveDate: formatRFC3339(formRawValues.receiveDate),
  //     comment: '',
  //     // isApproved: formRawValues.isApproved ? true : false,
  //     orderLines:
  //       formRawValues.orderLines.map((item) => {
  //         return {
  //           // id: item.orderId,
  //           stockItemId: item.stockItemId,
  //           orderedQuantity: item.orderedQuantity,
  //           expectedUnitCost: item.unitCost,
  //         };
  //       }),
  //   };

  //   const neededRequest = this.getNeededRequest(requestBody);

  //   this.requestIsSent = true;
  //   this.cdr.markForCheck();
  //   neededRequest
  //     .pipe(this.toHttpMakeOrder(status), takeUntil(this.unsubscribe$))
  //     .subscribe({
  //       next: () => {
  //         this.close.bind(this);
  //         this.notifier.saySuccess('შეკვეთა წარმატებით შეიქმნა');
  //       },
  //       error: () => {
  //         this.requestIsSent = false;
  //         this.cdr.markForCheck();
  //       },
  //     });
  // }

  // private getNeededRequest(requestBody: object): Observable<any> {
  //   if (this.editMode === EditModes.Edit) {
  //     return this.client.put<any>(`purchaseorders`, requestBody);
  //   }
  //   return this.client.post<any>(`purchaseorders`, requestBody);
  // }

  // private toHttpMakeOrder(status: OrderStatuses): OperatorFunction<any, any> {
  //   return switchMap((result) => {
  //     const id = (result && result.id) || this.editId;
  //     if (status === OrderStatuses.Ordered && id) {
  //       // const formRawValues = this.form.getRawValue();
  //       const data = {
  //         id,
  //         // sendEmail: !!formRawValues.sendEmail,
  //         // sendSMS: !!formRawValues.sendSMS
  //       };
  //       return this.client.put<any>('purchaseorders/order', data);
  //     }
  //     return of(null);
  //   });
  // }

  // called when
  submitOrderForExcelMode() {
    if (this.form.invalid) {
      this.markFormSumitted();
      this.form.markAllAsTouched();
      return;
    }

    of('saveOrderExcelMode')
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((_) => this.markRequestSent(true)),
        switchMap((_) => this.saveOrderRequest(this.orderId, true)),
        // tap((res) => console.log('dev => submitOrderForExcelMode => tap res:', res)),
        tap((_) => this.markRequestSent(false))
      )
      .subscribe((res) => {
        console.log('dev -> submitOrderForExcelMode res:', res);
        if (res?.id) {
          this._mixpanelService.track('Add Purchase (Success)');
          if (!res?.updated)
            this.notifier.saySuccess('შესყიდვა წარმატებით შეიქმნა');
          this.orderId = res?.id;
          this.addControlForFileInput();
          this.setInputsDisabled(true);
          this.orderSaved = true;
          this.cdr.markForCheck();
        }
      });
  }

  // if id is provided will create put request, post otherwise
  // if excelMode is present in form order lines will be empty
  private saveOrderRequest(
    orderId?: number,
    isExcel?: boolean
  ): Observable<any> {
    const formRawValues = this.form.getRawValue();
    console.log(
      'dev => AddOrderComponent => saveOrderRequest => this.formValue',
      formRawValues
    );
    const orderLines = !formRawValues.excelUpload
      ? formRawValues.orderLines.map((item) => {
          return {
            ...(item.orderLineId
              ? { id: Number.parseFloat(item.orderLineId) }
              : {}),
            stockItemId: Number.parseFloat(item.stockItemId),
            orderedQuantity: Number.parseFloat(item.orderedQuantity),
            expectedUnitCost: Number.parseFloat(item.unitCost),
          };
        })
      : [];
    const requestBody = {
      supplierId: formRawValues.supplierId,
      paymentMethod: formRawValues.paymentMethod,
      name: formRawValues.name,
      expectedReceiveDate: formatRFC3339(formRawValues.receiveDate),
      isExcel: !!isExcel,
      comment: '',
      orderLines: orderLines,
    };
    if (orderId) {
      return this.client
        .put<any>(`purchaseorders`, {
          id: orderId,
          ...requestBody,
        })
        .pipe(
          map((_) => ({ id: orderId, updated: true })) // put request does not return id so we transform
        );
    } else {
      return this.client.post<any>(`purchaseorders`, requestBody);
    }
  }

  private makeOrderRequest(orderId: number): Observable<any> {
    return this.client.put('purchaseorders/order', { id: orderId }).pipe(
      map((_) => of('success')),
      catchError((_) => EMPTY)
    );
  }

  private receiveOrderRequest(
    orderId: number,
    withoutOrderLines?: boolean
  ): Observable<any> {
    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: orderId,
      receiveDate: formatRFC3339(formRawValues.receiveDate),
      orderLines: withoutOrderLines
        ? []
        : formRawValues.orderLines
            .filter((orderLine: any) => !!orderLine)
            .map((orderLine: any) => {
              return {
                id: orderLine.orderLineId,
                receivedQuantity: orderLine.orderedQuantity,
                receivedUnitCost: orderLine.unitCost,
                unitPrice: orderLine.unitPrice,
              };
            }),
    };

    return this.client.put('purchaseorders/receive', requestBody).pipe(
      map((_) => {
        this.trackAddToStock(withoutOrderLines);
        return of('success');
      }),
      catchError((_) => EMPTY)
    );
  }

  onCancel(): void {
    if (this.form.dirty && !this.orderSaved) {
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
          title: 'ნამდვილად გსურს გაუქმება?',
          message: 'გაუქმების შემთხვევაში ცვლილებები არ შეინახება.',
          approveBtnLabel: 'კი',
          denyBtnLabel: 'არა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.close();
      });
  }

  onReceiveDateChange(date: Date): void {
    if (!date) {
      date = this.defaultDate;
    }
    date = endOfDay(date);
    this.receiveDate = date;
    this.setValue('receiveDate', date);
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/orders'
    );
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  // private getValue(controlName: string): any {
  //   return this.form.controls[controlName].value;
  // }

  private markFormGroupTouched(withOrderLines = true): void {
    // Object.values(this.form.controls).forEach((control) => {
    //   control.markAsTouched();
    // });
    this.form.markAllAsTouched();
    if (withOrderLines) this.orderLinesComponent.markFormGroupTouched();
  }

  getSuppliers = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: SupplierStatuses.Enabled.toString(),
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

  get title(): string {
    switch (this.editMode) {
      case EditModes.Edit:
        return 'ORDERS.ITEM.DETAILS.EDIT_ORDER';
      case EditModes.Duplicate:
        return 'ORDERS.ITEM.DETAILS.DUPLICATE_ORDER';
      case EditModes.Receive:
        return 'ORDERS.ITEM.DETAILS.RECEIVE_ORDER';
    }
    return 'ORDERS.ITEM.DETAILS.ADD_ORDER';
  }

  get orderLinesVisible(): boolean {
    return this.form?.controls['orderLines'] ? true : false;
  }

  get excelUploadVisible(): boolean {
    return this.form?.controls['selectedFile'] ? true : false;
  }

  get isFormExcelMode(): boolean {
    return this.form?.controls?.excelUpload?.value ? true : false;
  }

  get canReceiveExcelMode(): boolean {
    // console.log(
    //   'dev => this.form?.controls?.selectedFile?.value?.fileId',
    //   !!this.form?.controls?.selectedFile?.value?.fileId
    // );
    return !!this.form?.controls?.selectedFile?.value?.fileId;
  }

  get canSaveExcelMode(): boolean {
    return true;
  }

  get isFormInvalid(): boolean {
    return this?.form?.invalid;
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
  }

  getErrorMessage(controlName: string): string {
    return this.errorMessages[controlName];
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
