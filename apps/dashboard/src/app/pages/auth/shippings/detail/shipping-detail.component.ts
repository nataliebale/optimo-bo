import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  approveAction,
  ApproveDialogComponent
} from '@optimo/ui-popups-approve-dialog';
import { Subject, EMPTY, OperatorFunction, of, Observable } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material/bottom-sheet';
import {
  takeUntil,
  catchError,
  switchMap,
  map,
  tap,
  filter
} from 'rxjs/operators';
import { ShippingDetailProductsComponent } from './products/shipping-detail-products.component';
import { ShippingStatuses } from '../../../../core/enums/shipping-status.enum';
import { HttpParams } from '@angular/common/http';
import { LocationStatus } from '../../../../core/enums/location-status.enum';
import { RoutingStateService } from '@optimo/core';
import { LocationService } from '../../../../core/services/location/location.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { MixpanelService } from '@optimo/mixpanel';

export interface ISelectedFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
}

// tslint:disable-next-line:nx-enforce-module-boundaries
import {
  MAP_OF_TRANSPORTATION_METHODS,
  TransportationMethod
} from 'apps/dashboard/src/app/core/enums/transportation-method.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-shipping-detail',
  templateUrl: './shipping-detail.component.html',
  styleUrls: ['./shipping-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShippingDetailComponent implements OnInit, OnDestroy {
  @ViewChild(ShippingDetailProductsComponent)
  orderLinesComponent: ShippingDetailProductsComponent;

  form: FormGroup;
  item: any;
  orderLines: any[];
  shippingStatuses = ShippingStatuses;
  isSubmited: boolean;
  requestIsSent: boolean;
  locationIdFromName: string;

  private editId: number;
  editMode: boolean = false;
  private unsubscribe$ = new Subject<void>();

  citizenships = [
    { value: false, label: 'საქართველო' },
    { value: true, label: 'სხვა' }
  ];
  transportationTypes = MAP_OF_TRANSPORTATION_METHODS;
  TransportationMethod = TransportationMethod;
  entityIdentifierMask = '0*';
  endAddress = '';
  // instance variables for excel upload
  saveDraftVisible: boolean;
  shippingId: number;
  draftSaved: boolean;
  startAddress: any;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<ShippingDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private location: LocationService,
    private _translateService: TranslateService,
    private notifier: NotificationsService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && this.params.id
        ? 'Edit Stock Transfer'
        : 'Add Stock Transfer'
    );
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    this.shippingId = this.editId;
    if (this.editId) {
      this.editMode = true;
      this.getItemForEdit();
    } else {
      this.createForm();
      this.editMode = false;
    }
  }

  private getItemForEdit(): void {
    of('getItemForEdit')
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        switchMap((_) => this.getShippingReqtuest()),
        switchMap((shipping) =>
          this.getOrderLinesRequest().pipe(
            map((orderLines) => ({ ...shipping, orderLines }))
          )
        ),
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

  private getShippingReqtuest(): Observable<any> {
    return this.client.get(`stocktransferorders/${this.editId}`);
  }

  private getOrderLinesRequest(): Observable<any> {
    return this.client.get(`stocktransferorders/orderlines/${this.editId}`, {
      params: new HttpParams({
        fromObject: {
          skip: '0',
          take: '9999'
        }
      }),
      service: Service.Main
    });
  }

  private createForm(): void {
    const roadTransportationValidators = this.item &&
      (this.item.transportationType ===
        TransportationMethod.RoadTransportation ||
        !this.item.transportationType) && [Validators.required];

    const otherTransportationValidators = this.item &&
      this.item.transportationType === TransportationMethod.Other && [
        Validators.required
      ];

    const locationIdFrom =
      (this.item && +this.item.locationIdFrom) || +this.location.id;

    this.form = this.formBuilder.group({
      name: [this.item && this.item.name, [Validators.required]],
      locationIdFrom: [locationIdFrom],
      locationIdTo: [
        this.item && +this.item.locationIdTo,
        [Validators.required]
      ],
      endAddress: [
        (this.item && this.item.endAddress) || '',
        [Validators.required]
      ],
      transportationType: [
        (this.item && this.item.transportationType) ||
        TransportationMethod.RoadTransportation,
        [Validators.required]
      ],
      transportName: [
        this.item && this.item.transportName,
        otherTransportationValidators
      ],
      driverPIN: [
        this.item && this.item.driverPIN,
        roadTransportationValidators
      ],
      driverName: [
        this.item && this.item.driverName,
        roadTransportationValidators
      ],
      driverCarNumber: [
        this.item && this.item.driverCarNumber,
        roadTransportationValidators
      ],
      driverIsForeignСitizen: [
        this.item && this.item.driverIsForeignСitizen,
        roadTransportationValidators
      ],
      isExcelUpload: [!!this?.item?.isExcel]
    });
    this.getLocationById(locationIdFrom)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((obj) => {
        this.locationIdFromName = obj.name;
        // this.endAddress = obj.address;
        this.startAddress = obj.address;
        this.cdr.markForCheck();
      });

    if (this?.item?.isExcel) {
      this.transformFormGroupForExcel({
        fileId: null,
        fileName: this.item.excelFileName,
        fileUrl: this.item.excelFileUrl
      });
      this.markDraftSaved(true);
      this.form.controls?.name.disable();
      this.form.controls?.locationIdTo.disable();
      const controlNames = [
        'transportationType',
        'driverPIN',
        'driverName',
        'driverCarNumber',
        'driverIsForeignСitizen',
        'transportName',
        'endAddress'
      ];
      controlNames.forEach((controlName) => {
        this.form.controls[controlName].disable();
      });
    }

    this.form?.controls?.isExcelUpload.valueChanges.subscribe((checkboxVal) => {
      this.markDraftSaved(false);
      this.form.controls?.name.enable();
      this.form.controls?.locationIdTo.enable();
      const controlNames = [
        'transportationType',
        'driverPIN',
        'driverName',
        'driverCarNumber',
        'driverIsForeignСitizen',
        'transportName',
        'endAddress'
      ];
      controlNames.forEach((controlName) => {
        this.form.controls[controlName].enable();
      });
      if (checkboxVal) {
        this.transformFormGroupForExcel();
      } else {
        this.transformFormGroupForManual();
        if (this?.item) this.item.orderLines = [];
      }
      this.cdr.markForCheck();
    });
    this.cdr.markForCheck();
  }

  private transformFormGroupForExcel(defaultValue?: ISelectedFile) {
    this.form.addControl('selectedFile', new FormControl(defaultValue || null));
    this.cdr.markForCheck();
  }

  onCitizenshipChange(): void {
    const { driverPIN } = this.form.controls;
    this.checkIfCitizenIsNative(driverPIN);
    driverPIN.setValue(null);
    driverPIN.updateValueAndValidity();
  }

  private checkIfCitizenIsNative(driverPIN) {
    if (this.getValue('driverIsForeignСitizen')) {
      this.entityIdentifierMask = '0*';
      driverPIN.clearValidators();
    } else {
      this.entityIdentifierMask = '0{11}';
      driverPIN.setValidators([Validators.minLength(11), Validators.required]);
    }
  }

  private transformFormGroupForManual() {
    this.form.removeControl('selectedFile');
  }

  markDraftSaved(saveStatus: boolean): void {
    this.draftSaved = saveStatus;
  }

  get isDraftSaveVisible(): boolean {
    return !!this?.form?.controls?.isExcelUpload?.value && !this.draftSaved;
  }

  get isManualInputVisible(): boolean {
    return !this?.form?.controls?.isExcelUpload?.value;
  }

  get isExcelInputVisible(): boolean {
    return !!this?.form?.controls?.selectedFile && this.draftSaved;
  }

  get isFileUploaded(): boolean {
    return (
      !!this.form.controls?.selectedFile &&
      !!(this.form.controls?.selectedFile.value as ISelectedFile)?.fileName
    );
  }

  onLocationIdToChange(event): void {
    if (!event) return;
    if (this.item && event.id === this.item.locationIdTo) {
      this.endAddress = this.item.endAddress ? this.item.endAddress : event.address;
    } else {
      this.endAddress = event.address;
    }
    this.form.get('endAddress').setValue(this.endAddress);
  }

  saveOrderExcel(saveAndClose?: boolean): void {
    this.isSubmited = true;
    this.markFormGroupTouched();
    if (this.isFormInvalid) {
      this.form.markAllAsTouched();
      return;
    }

    of('saveOrderExcelMode')
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((_) => (this.requestIsSent = true)),
        switchMap((_) => this.saveOrderRequest(false, this.shippingId)),
        tap((_) => (this.requestIsSent = false))
      )
      .subscribe(
        (res) => {
          if (res) {
            this.notifier.saySuccess(
              this._translateService.instant(
                'Shipping.Item.Details.notifications.saveShippingSuccess'
              )
            );
            this.shippingId = res.id;
            this.isSubmited = false;
            this.markDraftSaved(true);
            this.form.controls?.name.disable();
            this.form.controls?.locationIdTo.disable();
            const controlNames = [
              'transportationType',
              'driverPIN',
              'driverName',
              'driverCarNumber',
              'driverIsForeignСitizen',
              'transportName',
              'endAddress'
            ];
            controlNames.forEach((controlName) => {
              this.form.controls[controlName].disable();
            });
            this.form.markAsPristine();
            this.cdr.markForCheck();
            if (saveAndClose) {
              this.close();
            }
          }
        },
        (err) => {
          console.error(err);
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      );
  }

  private saveOrderRequest(
    withOrderLines: boolean,
    shippingId?: number
  ): Observable<any> {
    this.isSubmited = true;

    this.markFormGroupTouched();
    if (this.isFormInvalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formRawValues = this.form.getRawValue();
    const requestBody = {
      ...formRawValues,
      isExcel: formRawValues.isExcelUpload,
      startAddress: this.startAddress,
      orderLines: withOrderLines
        ? this.orderLines
          .filter((item) => !!item)
          .map((item) => {
            return {
              stockItemId: item.stockItemId,
              quantity: item.quantity
            };
          })
        : []
    };

    return shippingId
      ? this.client.put('stocktransferorders', {
        id: shippingId,
        ...requestBody
      })
      : this.client.post('stocktransferorders', requestBody);
  }

  createOrderExcel(): void {
    approveAction(this.dialog, {
      title: 'Shipping.Item.Details.approveDialog.title',
      approveBtnLabel: 'Shipping.Item.Details.approveDialog.ship',
      denyBtnLabel: 'Shipping.Item.Details.approveDialog.cancel'
    })
      .pipe(
        filter((res) => res === true),
        tap((_) => {
          this.requestIsSent = true;
          this.cdr.markForCheck();
        }),
        switchMap((_) => {
          return this.finishOrderRequest(this.shippingId);
        }),
        tap((_) => {
          this._mixpanelService.track('Edit Stock Transfer (Success)');
          this.requestIsSent = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((_) => {
        this.close();
      });
  }

  private finishOrderRequest(id: number) {
    return this.client
      .put('stocktransferorders/finish', { id: id })
      .pipe(takeUntil(this.unsubscribe$));
  }

  createOrder(status: ShippingStatuses): void {
    this.isSubmited = true;
    debugger;
    this.markFormGroupTouched();
    if (this.isFormInvalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: this.editId || this.shippingId,
      ...formRawValues,
      startAddress: this.startAddress,
      orderLines: !formRawValues.isExcelUpload
        ? this.orderLines
          .filter((item) => !!item)
          .map((item) => {
            return {
              stockItemId: item.stockItemId,
              quantity: item.quantity
            };
          })
        : []
    };
    const request =
      this.editId || this.shippingId ? this.client.put : this.client.post;
    this.requestIsSent = true;
    this.cdr.markForCheck();
    request
      .bind(this.client)('stocktransferorders', requestBody)
      .pipe(this.toHttpfinish(status), takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.close();
          this._mixpanelService.track(
            this.editId || this.shippingId
              ? 'Edit Stock Transfer (Success) '
              : 'Add Stock Transfer (Success) '
          );
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      });
  }

  private toHttpfinish(status: ShippingStatuses): OperatorFunction<any, any> {
    return switchMap((result) => {
      const id = (result && result.id) || this.editId || this.shippingId;
      if (status === ShippingStatuses.Shipped && id) {
        const data = {
          id
        };
        return this.client.put('stocktransferorders/finish', data);
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

  onGenerateName(): void {
    if (this.form.controls?.name.disabled) {
      return;
    }
    let randomSufix = '';
    for (let i = 0; i < 8; i++) {
      randomSufix += Math.floor(Math.random() * 10);
    }
    this.form.controls.name.setValue(
      `${this._translateService.instant(
        'Shipping.ShippingButton'
      )}_${randomSufix}`
    );
  }

  private showCancelDialog() {
    if (this.isFileUploaded) {
      this.close();
      return;
    }
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no'
        }
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
      this.routingState.getPreviousUrlTree() || '/shippings'
    );
  }

  markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.orderLinesComponent) {
      this.orderLinesComponent.markFormGroupTouched();
    }
    this.onTransportationChange(false);
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  get title(): string {
    return this.editId
      ? 'Shipping.Item.Details.editShipping'
      : 'Shipping.Item.Details.addShipping';
  }

  get isFormInvalid(): boolean {
    return this.form?.controls?.isExcelUpload?.value
      ? this.form.invalid
      : this.form?.invalid ||
      !this.orderLines ||
      !this.orderLines.length ||
      this.orderLines
        .filter((item) => !!item)
        .some(
          (item) => !item.quantity || item.quantity > item.quantityOnHand
        );
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
  }

  getLocations = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'id',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: LocationStatus.Enabled.toString(),
        allLocations: 'true'
      }
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client
      .get<any>('locations', { params })
      .pipe(
        map((response) => {
          const filtred = response.data.filter(
            (location) =>
              location.id !== this.form.controls.locationIdFrom.value
          );
          response.totalCount -= response.data.length - filtred.length;
          response.data = filtred;
          return response;
        })
      );
  };

  getLocationById = (id: number): Observable<any> => {
    return this.client.get(`locations/${id}`);
  };

  onHasTransportationToggle(): void {
    this.onTransportationChange(true);
  }

  private setEndAddressDefaultValue(): void {
    if (!this.editId && !this.getValue('endAddress')) {
      this.form.controls['endAddress'].setValue(this.endAddress);
      this.form.controls['endAddress'].updateValueAndValidity();
    }
  }

  onTransportationChange(clearControlValue: boolean): void {
    const controlNamesForRoadTrans = [
      'driverPIN',
      'driverName',
      'driverCarNumber',
      'driverIsForeignСitizen'
    ];
    const controlNamesForOtherTrans = ['transportName'];
    if (
      this.getValue('transportationType') ===
      TransportationMethod.RoadTransportation
    ) {
      this.clearTransportationValidators(clearControlValue);
      controlNamesForRoadTrans.forEach((controlName) => {
        if (controlName === 'driverPIN') {
          this.checkIfCitizenIsNative(this.form.controls[controlName]);
        } else {
          this.form.controls[controlName].setValidators([Validators.required]);
        }
      });
      this.setEndAddressDefaultValue();
    } else if (
      this.getValue('transportationType') === TransportationMethod.Other
    ) {
      this.clearTransportationValidators(clearControlValue);
      controlNamesForOtherTrans.forEach((controlName) => {
        this.form.controls[controlName].setValidators([Validators.required]);
      });
      this.setEndAddressDefaultValue();
    } else {
      this.clearTransportationValidators(clearControlValue);
    }
    controlNamesForRoadTrans.forEach((controlName) => {
      this.form.controls[controlName].updateValueAndValidity();
    });
    controlNamesForOtherTrans.forEach((controlName) => {
      this.form.controls[controlName].updateValueAndValidity();
    });
  }

  private clearTransportationValidators(clearValue: boolean): void {
    const controlNames = [
      'driverPIN',
      'driverName',
      'driverCarNumber',
      'driverIsForeignСitizen',
      'transportName'
    ];
    controlNames.forEach((controlName) => {
      this.form.controls[controlName].clearValidators();
      if (clearValue) {
        this.form.controls[controlName].setValue(null);
      }
    });
    if (clearValue) {
      this.form.controls.endAddress.setValue(null);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
