import {
  MAP_OF_TRANSPORTATION_METHODS,
  TransportationMethod,
} from './../../../../core/enums/transportation-method.enum';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
  NgModel,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { Subject, EMPTY, OperatorFunction, of, Observable, concat } from 'rxjs';
import { ClientService, Service, StorageService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { pairOfEntitySaleOrderPaymentMethods } from '../../../../core/enums/payment-methods.enum';
import {
  takeUntil,
  catchError,
  switchMap,
  distinctUntilChanged,
  tap,
  map,
} from 'rxjs/operators';
import { EntitySalesDetailProductsComponent } from './products/entity-sales-detail-products.component';
import { EntitySaleStatus } from '../../../../core/enums/entity-sale-status.enum';
import { HttpParams } from '@angular/common/http';
import { LocationStatus } from '../../../../core/enums/location-status.enum';
import { RoutingStateService } from '@optimo/core';
import decode from 'jwt-decode';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
import { UserDetails } from '../../profile/personal-information/profile-personal-information.component';
import { MixpanelService } from '@optimo/mixpanel';

enum ControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}

@Component({
  selector: 'app-entity-sales-detail',
  templateUrl: './entity-sales-detail.component.html',
  styleUrls: ['./entity-sales-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntitySalesDetailComponent implements OnInit, OnDestroy {
  @ViewChild(EntitySalesDetailProductsComponent)
  orderLinesComponent: EntitySalesDetailProductsComponent;

  @ViewChild('clientsSelector', { static: true })
  clientsSelector: NgModel;

  public taxRateCheckboxState = false;
  set taxRateState(state: boolean) {
    this.taxRateCheckboxState = state;
  }

  form: FormGroup;
  item: any;
  locations: any[];
  transportName = false;

  paymentMethods = pairOfEntitySaleOrderPaymentMethods;
  entitySaleStatus = EntitySaleStatus;

  orderLines: any[];

  entityTypes = [
    { value: '1', label: 'ინდ. მეწარმე' },
    { value: '2', label: 'შ.პ.ს.' },
    { value: '3', label: 'ს.ს.' },
  ];

  citizenships = [
    { value: false, label: 'საქართველო' },
    { value: true, label: 'სხვა' },
  ];

  transportationTypes = MAP_OF_TRANSPORTATION_METHODS;
  TransportationMethod = TransportationMethod;

  isSubmited: boolean;
  requestIsSent: boolean;
  entityIdentifierMask = '0*';
  userDetails: UserDetails;
  clients$: Observable<any[]>;
  clientsLoading = false;
  clientsInput$ = new Subject<string>();
  taxRate: any;
  private _selectedClient: any;

  set selectedClient(value: any) {
    this._selectedClient = value;
    if (value) {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const control = this.form.controls[key];
          if (control) {
            control.setValue(value[key]);
          }
        }
      }
      this.cdr.markForCheck();
    }
  }

  set setSelectedClientWithoutFormSet(value: {}) {
    this._selectedClient = value;
  }

  get selectedClient(): any {
    return this._selectedClient;
  }

  private editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<EntitySalesDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private storage: StorageService,
    private location: LocationService,
    private _mixpanelService: MixpanelService
  ) {
    this.getUserDetails();
    this._mixpanelService.track(
      this.params && +this.params.id ? 'Edit B2B Sale' : 'Add B2B Sale'
    );
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    this.getLocations();
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
    this.loadClients();
  }

  get entityIdMask() {
    return this.getValue('entityType') === '1' ? '00000000000' : '000000000';
  }

  //   get taxRate() {
  //     const decodeToken = decode(this.storage.getAccessToken());
  //     return decodeToken['taxRate'];
  //   }

  private getUserDetails(): void {
    this.client
      .get<any>('user/getuserdetails', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userDetails) => {
        this.userDetails = userDetails;
        this.taxRate = userDetails.taxRate;
        this.cdr.markForCheck();
      });
  }

  get isHoreca(): boolean {
    return this.storage.isHorecaMode;
  }

  onEntityIdStatusChange(
    status: ControlStatus,
    entityIdControl: AbstractControl
  ) {
    if (entityIdControl?.value === '') {
      entityIdControl?.markAsPristine();
      console.log('entityIdControl:', entityIdControl);
      this.cdr.markForCheck();
    }
  }

  private getItemForEdit(): void {
    this.client
      .get(`entitysaleorders/${this.editId}`)
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
        this.setSelectedClientWithoutFormSet = result;
        this.createForm();
        this.taxRateState = result['taxAmount'] ? true : false;
      });
  }

  private createForm(): void {
    const roadTransportationValidators = this.item &&
      this.item.hasTransportation &&
      this.item.transportationType ===
        TransportationMethod.RoadTransportation && [Validators.required];

    const otherTransportationValidators = this.item &&
      this.item.hasTransportation &&
      this.item.transportationType === TransportationMethod.Other && [
        Validators.required,
      ];

    const locationIdFrom =
      (this.item && +this.item.locationIdFrom) || +this.location.id;

    this.form = this.formBuilder.group({
      entityName: [this.item && this.item.entityName, [Validators.required]],
      // entityType: [{value: (this.item && this.item.entityType) || null, disabled: true},  [Validators.required]],
      entityIdentifier: [
        this.item && this.item.entityIdentifier,
        [Validators.required],
      ],
      paymentMethod: [
        this.item && this.item.paymentMethod,
        [Validators.required],
      ],
      startAddress: [
        this.item && this.item.startAddress,
        [Validators.required],
      ],
      endAddress: [
        {
          value:
            (this.item &&
              this.item.hasTransportation &&
              this.item.endAddress) ||
            null,
          disabled: !this.item || !this.item.hasTransportation,
        },
        [Validators.required],
      ],
      comment: [this.item && this.item.comment],
      hasTransportation: [
        (this.item && this.item.hasTransportation) || false,
        [Validators.required],
      ],
      transportationType: [
        (this.item && this.item.transportationType) ||
          TransportationMethod.RoadTransportation,
        [Validators.required],
      ],
      taxRate: [this.item && this.item.taxAmount ? true : false],
      transportName: [
        this.item && this.item.transportName,
        otherTransportationValidators,
      ],
      driverPIN: [
        this.item && this.item.driverPIN,
        roadTransportationValidators,
      ],
      driverName: [
        this.item && this.item.driverName,
        roadTransportationValidators,
      ],
      driverCarNumber: [
        this.item && this.item.driverCarNumber,
        roadTransportationValidators,
      ],
      driverIsForeignСitizen: [
        this.item && this.item.driverIsForeignСitizen,
        roadTransportationValidators,
      ],
    });

    if (!this.editId) {
      this.getLocationById(locationIdFrom)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(({ address }) => {
          this.form.controls['startAddress'].setValue(address);
          this.form.controls['startAddress'].updateValueAndValidity();
          this.cdr.markForCheck();
        });
    }

    const entityIdControl: AbstractControl = this.form.get('entityIdentifier');
    entityIdControl.statusChanges.subscribe((status: ControlStatus) => {
      this.onEntityIdStatusChange(status, entityIdControl);
    });
    this.cdr.markForCheck();
  }

  private loadClients(): void {
    this.clients$ = concat(
      of([]),
      this.clientsInput$.pipe(
        distinctUntilChanged(),
        tap(() => {
          this.clientsLoading = true;
          this.cdr.markForCheck();
        }),
        switchMap((term) =>
          this.getEntityClients(term).pipe(
            catchError(() => of([])),
            map(({ data }) => data),
            tap(() => {
              this.clientsLoading = false;
              this.cdr.markForCheck();
            })
          )
        )
      )
    );
  }

  onHasTransportationToggle(): void {
    this.onTransportationChange();
  }

  onTransportationChange(): void {
    const controlNamesForRoadTrans = [
      // 'driverPIN',
      'driverName',
      'driverCarNumber',
      'driverIsForeignСitizen',
    ];
    const controlNamesForOtherTrans = ['transportName'];
    if (
      this.getValue('hasTransportation') &&
      this.getValue('transportationType') ===
        TransportationMethod.RoadTransportation
    ) {
      this.clearTransportationValidators();
      controlNamesForRoadTrans.forEach((controlName) => {
        this.form.controls[controlName].setValidators([Validators.required]);
      });
      this.form.controls.endAddress.enable();
    } else if (
      this.getValue('hasTransportation') &&
      this.getValue('transportationType') === TransportationMethod.Other
    ) {
      this.clearTransportationValidators();
      controlNamesForOtherTrans.forEach((controlName) => {
        this.form.controls[controlName].setValidators([Validators.required]);
      });
      this.form.controls.endAddress.enable();
    } else {
      this.clearTransportationValidators();
    }
    this.onCitizenshipChange();
    controlNamesForRoadTrans.forEach((controlName) => {
      this.form.controls[controlName].updateValueAndValidity();
    });
    controlNamesForOtherTrans.forEach((controlName) => {
      this.form.controls[controlName].updateValueAndValidity();
    });
  }

  private clearTransportationValidators(): void {
    const controlNames = [
      // 'driverPIN',
      'driverName',
      'driverCarNumber',
      'driverIsForeignСitizen',
      'transportName',
    ];
    controlNames.forEach((controlName) => {
      this.form.controls[controlName].clearValidators();
      this.form.controls[controlName].setValue(null);
    });
    this.onCitizenshipChange();
    this.form.controls.endAddress.setValue(null);
    this.form.controls.endAddress.disable();
  }

  onCitizenshipChange(): void {
    const { driverPIN } = this.form.controls;
    if (
      !this.getValue('hasTransportation') ||
      this.getValue('transportationType') !==
        TransportationMethod.RoadTransportation ||
      this.getValue('driverIsForeignСitizen') ||
      this.getValue('driverIsForeignСitizen') === null
    ) {
      this.entityIdentifierMask = '0*';
      driverPIN.clearValidators();
    } else {
      this.entityIdentifierMask = '0{11}';
      driverPIN.setValidators([Validators.minLength(11), Validators.required]);
    }
    driverPIN.setValue(null);
    driverPIN.updateValueAndValidity();
  }

  createOrder(status: EntitySaleStatus): void {
    console.log(
      'TCL: EntitySalesDetailComponent -> this.form',
      this.form.getRawValue()
    );

    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormGroupTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: this.editId,
      ...formRawValues,
      entityClientId: this._selectedClient.id,
      taxRate: this.form.get('taxRate').value ? this.taxRate : 0,
      orderLines: this.orderLines
        .filter((item) => !!item)
        .map((item) => {
          return {
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };
        }),
    };

    this.requestIsSent = true;

    this.cdr.markForCheck();
    this.client
      .post('entitysaleorders', requestBody)
      .pipe(this.toHttpfinish(status), takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this._mixpanelService.track(
            this.editId ? 'Edit B2B Sale (Success)' : 'Add B2B Sale (Success)'
          );
          this.close();
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  private toHttpfinish(status: EntitySaleStatus): OperatorFunction<any, any> {
    return switchMap((result) => {
      const id = (result && result.id) || this.editId;
      if (status === EntitySaleStatus.Sold && id) {
        const data = {
          id,
        };
        return this.client.put('entitysaleorders/finish', data);
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

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/entity-sales'
    );
  }

  private getLocations(): void {
    this.client
      .get('locations', {
        params: new HttpParams({
          fromObject: {
            pageIndex: '0',
            sortField: 'id',
            sortOrder: 'ASC',
            pageSize: '20',
            status: LocationStatus.Enabled.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        this.locations = data;
        this.cdr.markForCheck();
      });
  }

  private markFormGroupTouched(): void {
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        console.log('The control is INVALID', name);
      }
    }
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    this.orderLinesComponent.markFormGroupTouched();
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }

  get isFormInvalid(): boolean {
    return (
      this.form.invalid ||
      !this.orderLines ||
      !this.orderLines.length ||
      this.orderLines
        .filter((item) => !!item)
        .some((item) => {
          return !item.quantity || !item.unitPrice;
        })
    );
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
  }

  private getEntityClients(term: string): Observable<any> {
    let params = new HttpParams({
      fromObject: {
        sortField: 'entityName',
        sortOrder: 'ASC',
        pageIndex: '0',
        pageSize: '20',
        status: '0',
      },
    });

    if (term && term !== '') {
      params = params.append('entityNameOrIdentifier', term);
    }

    return this.client.get('entityclient', { params });
  }

  getLocationById = (id: number): Observable<any> => {
    return this.client.get(`locations/${id}`);
  };

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
