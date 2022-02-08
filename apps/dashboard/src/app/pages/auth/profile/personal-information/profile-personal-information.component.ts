import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  LOCALE_ID,
  Inject,
} from '@angular/core';
import { ClientService, Service, StorageService } from '@optimo/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { formatDate } from '@angular/common';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { VerifyPhoneComponent } from '../verify-phone/verify-phone.component';
import { EFieldType } from '../form-field-edit-view/form-field-edit-view.component';
import { MixpanelService } from '@optimo/mixpanel';
import { Providers } from 'apps/dashboard/src/app/core/enums/providers.enum';
import { select, Store } from '@ngrx/store';
import * as fromAppState from '../../../../state';

export interface UserDetails {
  companyName: string;
  brandName: string;
  identificationNumber: string;
  companyType: number;
  creationDate: Date;
  businessType: number[];
  isWATRegistered: boolean;
  phoneNumber: string;
  email: string;
  address: string;
  legalAddress: string;
  phones: string[];
  isEntitySaleEnabled: boolean;
  taxRate: number;
  integrationData: {
    provider: number;
    isActive: boolean;
    providerFeePercent: number;
    optimoFeePercent: number;
  }[];
  data: {
    rsUser: string;
    rsPassword: string;
  };
}

@Component({
  selector: 'app-profile-personal-information',
  templateUrl: './profile-personal-information.component.html',
  styleUrls: ['./profile-personal-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePersonalInformationComponent implements OnInit, OnDestroy {
  userDetails: UserDetails;
  form: FormGroup;
  public EFieldType = EFieldType;
  private unsubscribe$ = new Subject<void>();
  businessTypesDropDownData: Array<{ id: number; text: string }>;
  public isHorecaMode = this._storageService.isHorecaMode;
  public launchedByViewAs$: Observable<boolean>;
  public glovoProvider: boolean;
  public isAdmin = this._storageService.isAdmin;
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private _storageService: StorageService,
    private _mixpanelService: MixpanelService,
    private _store: Store
  ) {
    this.createForm();
    this._mixpanelService.track('Personal Information');
  }

  ngOnInit(): void {
    this.getBusinessTypes();
    this.getUserDetails();
    this.getLaunchedByViewAs();
  }

  private getLaunchedByViewAs(): void {
    this.launchedByViewAs$ = this._store.pipe(
      select(fromAppState.getLaunchedByViewAs)
    );
  }

  private getUserDetails(): void {
    this.client
      .get<any>('user/getuserdetails', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userDetails) => {
        this.userDetails = userDetails;
        this.glovoProvider = !!userDetails?.integrationData?.find(
          (el) => el.provider === Providers.Glovo
        );
        this.cdr.markForCheck();

        this.fillForm(userDetails);
      });
  }

  private fillForm(userDetails: UserDetails): void {
    this.form.patchValue({
      brandName: userDetails.brandName,
      isEntitySaleEnabled: userDetails.isEntitySaleEnabled,
      isActive: !!userDetails?.integrationData?.find(el => el.provider === Providers.Glovo),
      taxRate: userDetails.taxRate,
      providerFeePercent: userDetails.integrationData?.[0]?.providerFeePercent,
      optimoFeePercent: userDetails.integrationData?.[0]?.optimoFeePercent,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      brandName: ['', [Validators.required]],
      isEntitySaleEnabled: ['', [Validators.required]],
      isActive: ['', [Validators.required]],
      optimoFeePercent: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.min(0),
          Validators.max(100),
        ],
      ],
      providerFeePercent: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.min(0),
          Validators.max(100),
        ],
      ],
      taxRate: [
        '',
        [
          Validators.required,
          CustomValidators.OnlyNumbers,
          Validators.min(0),
          Validators.max(100),
        ],
      ],
    });
  }

  private getBusinessTypes(): void {
    this.client
      .get<any>('businesstypes', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((businessTypes) => {
        this.businessTypesDropDownData = businessTypes.map(
          ({ businessTypeId, name }) => ({
            id: businessTypeId,
            text: name,
          })
        );

        this.cdr.markForCheck();
      });
  }

  get businessTypeName(): string {
    if (
      !this.userDetails ||
      !this.userDetails.businessType ||
      !this.businessTypesDropDownData
    ) {
      return '';
    }

    const found = this.businessTypesDropDownData.find(
      ({ id }) => id === this.userDetails.businessType[0]
    );

    return found ? found.text : '';
  }

  onSave(field: string): void {
    const value = this.getValue(field);
    this.client
      .post(
        'User/UpdateUserDetails',
        {
          [field]: value,
        },
        { service: Service.Auth }
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.userDetails[field] = value;
        this.cdr.markForCheck();
      });
  }

  onGlovoSave(field: string): void {
    this.client
      .post(
        'User/UpdateUserDetails',
        {
          integrationData: {
            provider: Providers.Glovo,
            [field]: this.getValue(field),
          },
        },
        { service: Service.Auth }
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.getUserDetails();
      });
  }

  private getValue(field: string): any {
    return this.form.get(field).value;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
