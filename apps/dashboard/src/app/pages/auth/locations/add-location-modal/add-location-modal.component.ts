import { MixpanelService } from '@optimo/mixpanel';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ClientService, StorageService } from '@optimo/core';
import { takeUntil, catchError, tap } from 'rxjs/operators';
import { EMPTY, Subject, of, zip, Observable } from 'rxjs';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import decode from 'jwt-decode';
import { EventBusService } from 'apps/dashboard/src/app/core/services/event-bus-service/event-bus.service';
import { LocationService } from '../../../../core/services/location/location.service';

export enum OperatorPermision {
  CanReceivePurchaseOrders,
  CanSetDiscount,
  CanChangePrice,
  CanDeleteFromBasket,
}

@Component({
  selector: 'app-add-location-modal',
  templateUrl: './add-location-modal.component.html',
  styleUrls: ['./add-location-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLocationModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  private editItem: any;
  private unsubscribe$ = new Subject<void>();
  requestIsSent: boolean;

  cityNameControl: FormControl = new FormControl('');
  cityDescriptions: {cityName: string, districts: {id: number, districtName: string}[]}[]
  cityNamesList: {cityName: string}[] = [];
  districtNamesList: {districtName: string, id: number}[] = [];
  locationsAddressNamesMap: {
    cityName: string;
    id: number;
    districtName: string;
  }[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddLocationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private storage: StorageService,
    private _mixpanelService: MixpanelService,
    private eventBus: EventBusService,
    private location: LocationService
  ) {
    // this.createForm(false);
  }

  ngOnInit(): void {
    console.log('TCL: AddLocationModalComponent -> this.data', this.data);
    this.checkExistedForExtraLocationAndFetchLocations();
  }

  private checkExistedForExtraLocationAndFetchLocations(): void {
    zip(
      this.client.get('locations/extra'),
      this.fetchAddresIds(),
    )
      .pipe(
        catchError(() =>  this.fetchAddresIds()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        const hasAlreadyExtra = data.length>1 && data[0]['isForExtra']!==undefined ? !!data : false;
        if (this.data) {
          this.getEditData(hasAlreadyExtra);
        } else {
          this.createForm(hasAlreadyExtra);
        }
      });
  }

  private getEditData(hasAlreadyExtra: boolean): void {
    zip(
      this.client.get('locations/' + this.data),
    )
      .pipe(
        catchError(() => {
          this.onClose();
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      ).subscribe(([result, addressDescriptions]) => {
        if (result) {
          this.editItem = result;
          this.createForm(hasAlreadyExtra);
        } else {
          this.onClose();
        }
      });
  }

  private locationAddressIdRequiredIfCitySelected: ValidatorFn = (locationAddressIdControl: AbstractControl): ValidationErrors | null => {
    const cityControl = this.cityNameControl;

    if (!!cityControl.value && !locationAddressIdControl.value) {
      return {
        fieldRequred: 'city selected but district is not present',
      }
    } else {
      return null;
    }
  }

  private createForm(hasAlreadyExtra: boolean): void {
    const accessToken = this.storage.getAccessToken();
    const tokenPayload = decode(accessToken);
    const { isAdmin } = tokenPayload;

    if (this.editItem?.locationAddressId) {
      const selectedCity = this.cityDescriptions.find(
        (cityDescription) =>
          cityDescription.districts.some(
            (district) => district.id === this.editItem.locationAddressId
          )
      )
      this.cityNameControl.setValue(selectedCity.cityName);
      this.districtNamesList = selectedCity.districts;
    }
    this.form = this.fb.group({
      name: [this.editItem?.name, Validators.required],
      address: [this.editItem?.address, Validators.required],
      locationAddressId: [this.editItem?.locationAddressId, this.locationAddressIdRequiredIfCitySelected],
      phoneNumber: [this.editItem?.phoneNumber, Validators.required],
      managerName: [this.editItem?.managerName, Validators.required],
      isForExtra: [
        {
          value: this.editItem?.isForExtra,
          disabled: hasAlreadyExtra && !(isAdmin && this.editItem?.isForExtra),
        },
      ],
      // autoUploadEntitySalesToRS: [this.editItem?.autoUploadEntitySalesToRS],
    });

    this.cityNameControl.valueChanges
      .pipe(
        tap(((cityName) => {
          this.districtNamesList = this.cityDescriptions.find((cityDescription) => cityDescription.cityName === cityName).districts;
          this.form.controls.locationAddressId.setValue(undefined);
          this.cdr.markForCheck();
        })),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('TCL: AddLocationModalComponent -> this.form', this.form);
      return;
    }
    const data = {
      id: this.editItem && this.editItem.id,
      ...this.form.getRawValue(),
    };

    const request = this.data ? this.client.put : this.client.post;

    this.requestIsSent = true;
    request
      .bind(this.client)('locations', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: any) => {
          this._mixpanelService.track(
            this.data ? 'Edit Location (Success)' : 'Add Location (Success)'
          );
          this.location.makeLocationsEmpty();
          this.eventBus.locationsUpdated();
          this.dialogRef.close((result && result.id) || true);
        },
        error: () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
      });
  }

  onClose(): void {
    if (this.form.pristine) {
      this.dialogRef.close(false);
      return;
    }
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
      .subscribe((r) => {
        if (r) {
          this.dialogRef.close(false);
        }
      });
  }

  fetchAddresIds(): Observable<{cityName: string, districts: {id: number, districtName: string}[]}[]> {
    return this.client.get('shared/location-addresses')
      .pipe(
        tap((res: {cityName: string, districts: {id: number, districtName: string}[]}[]) => {
          this.cityNamesList = res.map((cityDescription) => ({cityName: cityDescription.cityName}));
          this.cityDescriptions = res;
        }),
        takeUntil(this.unsubscribe$),
      )
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
