import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ClientService } from '@optimo/core';
import { catchError, takeUntil, map } from 'rxjs/operators';
import { EMPTY, Subject, Observable, of } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { CustomValidators } from 'apps/admin-panel/src/app/core/helpers/validators/validators.helper';
// tslint:disable-next-line:nx-enforce-module-boundaries
import {
  CompanyTypeTitles,
  ECompanyType,
} from 'apps/admin-panel/src/app/core/enums/ECompanyType';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { OptimoProductTypeTitles } from 'apps/admin-panel/src/app/core/enums/EProductType';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { PackageTypeTitles } from 'apps/admin-panel/src/app/core/enums/EPackageType';
import { MatDialog } from '@angular/material/dialog';
import { UserDetailComponent } from '../../users/detail/user-detail.component';
import { MixpanelService } from '@optimo/mixpanel';
import { format } from 'date-fns';

@Component({
  selector: 'app-legal-entity-detail',
  templateUrl: './legal-entity-detail.component.html',
  styleUrls: ['./legal-entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  OptimoProductTypeTitles = OptimoProductTypeTitles;
  CompanyTypeTitles = CompanyTypeTitles;
  PackageTypeTitles = PackageTypeTitles;
  fileUrl: string;
  editMode: boolean;
  form: FormGroup;
  editId: number;
  editLegalEntity: any;
  isSubmited: boolean;
  businessTypes: any;
  requestId: any;
  registrationRequest: any;
  alreadyExists: boolean;
  errorText: string;
  INN = true;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<LegalEntityDetailComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private _mixpanelService: MixpanelService
  ) {}

  public ngOnInit(): void {
    this.editId = this.params && this.params.id;
    this.requestId = this.params && this.params.requestId;
    console.log('Params: ', this.params);
    this.editMode = !!this.editId;
    if (this.editId) {
      this.getItemForEdit();
    } else if (this.requestId) {
      this.getItemForCreate();
    } else {
      this.createForm(null);
    }
  }

  public onFileUpload(response) {
    console.log(response);
    this.form.get('fileName').setValue(response?.fileName);
    this.fileUrl = response.fileUrl;
    this.cdr.markForCheck();
  }

  private listenCreateNewUserProps() {
    if (this.requestId) {
      this.createNewUserValidations(true);
    }

    this.form
      .get('createNewUser')
      .valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((val: boolean) => {
        this.createNewUserValidations(val);
      });
  }

  private createNewUserValidations(value: boolean) {
    if (value) {
      this.form.get('firstName').setValidators([Validators.required]);
      this.form.get('lastName').setValidators([Validators.required]);
      this.form
        .get('phoneNumber')
        .setValidators([Validators.required, CustomValidators.PhoneNumber]);
      this.form
        .get('email')
        .setValidators([Validators.required, CustomValidators.Email]);
      this.form.get('userId').setValidators([]);
    } else {
      this.form.get('firstName').setValidators([]);
      this.form.get('lastName').setValidators([]);
      this.form.get('phoneNumber').setValidators([]);
      this.form.get('email').setValidators([]);
      this.form.get('userId').setValidators([Validators.required]);
    }
    this.form.get('firstName').updateValueAndValidity();
    this.form.get('lastName').updateValueAndValidity();
    this.form.get('phoneNumber').updateValueAndValidity();
    this.form.get('email').updateValueAndValidity();
    this.form.get('userId').updateValueAndValidity();
  }

  createForm(LegalEntity: any) {
    this.form = this.fb.group({
      companyType: [
        LegalEntity &&
        (LegalEntity.companyType || LegalEntity.companyType === 0)
          ? String(LegalEntity.companyType)
          : null,
        [Validators.required],
      ],
      identificationNumber: [
        (LegalEntity && LegalEntity.identificationNumber) || null,
        [Validators.required],
      ],
      companyName: [
        (LegalEntity && LegalEntity.companyName) || null,
        [Validators.required],
      ],
      brandName: [
        (LegalEntity && LegalEntity.brandName) || null,
        [Validators.required],
      ],
      address: [
        (LegalEntity && LegalEntity.address) || null,
        [Validators.required],
      ],
      legalAddress: [
        (LegalEntity && LegalEntity.legalAddress) || null,
        [Validators.required],
      ],
      packageType: [
        LegalEntity &&
        (LegalEntity.packageType || LegalEntity.packageType === 0)
          ? String(LegalEntity.packageType)
          : null,
        [Validators.required],
      ],
      businessType: [
        (LegalEntity &&
          LegalEntity.businessType &&
          LegalEntity.businessType[0]) ||
          null,
        [Validators.required],
      ],
      isWATRegistered: [(LegalEntity && LegalEntity.isWATRegistered) || false],
      fileName: [
        (LegalEntity && LegalEntity.document) || null,
        [Validators.required],
      ],
      isForTesting: [(LegalEntity && LegalEntity.isForTesting) || false],
      productType: [
        LegalEntity &&
        (LegalEntity.productType || LegalEntity.productType === 0)
          ? String(LegalEntity.productType)
          : null,
        [Validators.required],
      ],
      createNewUser: [(LegalEntity && LegalEntity.createNewUser) || false],
      userId: [
        (LegalEntity && LegalEntity.userId) || null,
        [Validators.required],
      ],
      firstName: [
        LegalEntity && LegalEntity.createNewUser && LegalEntity.firstName,
      ],
      lastName: [
        LegalEntity && LegalEntity.createNewUser && LegalEntity.lastName,
      ],
      phoneNumber: [
        LegalEntity && LegalEntity.createNewUser && LegalEntity.phoneNumber,
      ],
      email: [LegalEntity && LegalEntity.createNewUser && LegalEntity.email],
    });
    this.listenCreateNewUserProps();
    this.updateValidity();
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.location.back();
  }

  onClose(): void {
    if (this.requestId) {
      this.bottomSheetRef.dismiss('/registration-requests');
    } else {
      this.bottomSheetRef.dismiss('/legal-entities');
    }
  }

  getItemForEdit(): void {
    this.clientService
      .get(`legalentities/single?id=${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.close();
        }
        this.editLegalEntity = result;
        this.createForm(result);
      });
  }

  getItemForCreate(): void {
    this.clientService
      .get(`registrationrequests/single?id=${this.requestId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.close();
        }
        this.registrationRequest = result;

        console.log('Registration Request: ', result);
        this.createFormFromRegistrationRequest(result);
      });
  }

  private createFormFromRegistrationRequest(result: any) {
    result.brandName = result.companyName;
    result.productType = 0;
    result.createNewUser = true;
    result.businessType = result.businessTypes.length
      ? [result.businessTypes[0].id]
      : null;
    this.createForm(result);
  }

  private close(): void {
    this.bottomSheetRef.dismiss(true);
  }

  async onSubmit() {
    this.alreadyExists = false;
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }

    const formRawValues = this.form.getRawValue();
    const requestBody = {
      companyType: +formRawValues.companyType,
      identificationNumber: formRawValues.identificationNumber,
      companyName: formRawValues.companyName,
      brandName: formRawValues.brandName,
      address: formRawValues.address,
      legalAddress: formRawValues.legalAddress,
      packageType: +formRawValues.packageType,
      businessType: [formRawValues.businessType],
      isWATRegistered: formRawValues.isWATRegistered,
      isForTesting: formRawValues.isForTesting,
      productType: +formRawValues.productType,
      fileName: formRawValues.fileName,
      createNewUser: formRawValues.createNewUser,
      userId: formRawValues.userId,
      phoneNumber: formRawValues.phoneNumber,
      email: formRawValues.email,
      firstName: formRawValues.firstName,
      lastName: formRawValues.lastName,
    };

    if (this.editId) {
      requestBody['id'] = this.editLegalEntity.id;
      this.clientService
        .put<any>(`legalentities`, requestBody)
        .pipe(
          catchError(() => {
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          this.onClose();
        });
    } else {
      this.clientService
        .post<any>('legalentities', requestBody)
        .pipe(
          catchError((error) => {
            this.checkLegalEntityIdentification(error);
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          this._mixpanelService.track('Account Created', {
            createDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          });
          if (!result) {
            this.onCancel();
          }
          this.onClose();
        });
    }
  }

  private checkLegalEntityIdentification(result): void {
    if (result && result.error && result.error.message) {
      this.alreadyExists = true;
      switch (result.error.errorCode) {
        case 0:
          this.errorText = 'ბიზნეს ტიპი ამ სახელით უკვე არსებობს';
          this.form.controls['identificationNumber'].setValue(null);
          this.form.get('identificationNumber').markAsTouched();
          this.cdr.markForCheck();
          break;
        case 1:
          this.errorText = 'მომხმარებელი ამ ელ.ფოსტით უკვე არსებობს';
          this.form.controls['email'].setValue(null);
          this.form.get('email').markAsTouched();
          this.cdr.markForCheck();
          break;
        case 2:
          this.errorText = 'მომხმარებელი ამ ტელეფონის ნომერით უკვე არსებობს';
          this.form.controls['phoneNumber'].setValue(null);
          this.form.get('phoneNumber').markAsTouched();
          this.cdr.markForCheck();
          break;
        default:
          this.errorText = 'ზოგადი შეცდომა';
      }
      if (this.form.invalid) {
        this.cdr.markForCheck();
        console.log('form is invalid');
        return;
      }
    }
  }

  getBusinessTypes = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.clientService.get<any>('businesstypes', { params });
  };

  getBusinessTypeById = (id: number): Observable<any> => {
    return this.clientService.get<any>(`businesstypes/${id}`);
  };

  getUsers = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'id',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('fullNameOrPhoneNumber', state.searchValue);
    }

    return this.clientService
      .get<any>('users', { params })
      .pipe(
        map((response) => {
          return {
            data: response.data.map((user) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              phoneNumber: `${user.phoneNumber}`,
            })),
            totalCount: response.totalCount,
          };
        })
      );
  };

  getUsersById = (id: string): Observable<any> => {
    return this.clientService.get<any>(`users/single?id=${id}`).pipe(
      map((user) => ({
        id: user.id,
        name: `სრული სახელი: ${user.firstName} ${user.lastName}, ტელეფონი: ${user.phoneNumber}`,
      }))
    );
  };

  getProductTypes = (state: any): Observable<any> => {
    return of({
      data: this.OptimoProductTypeTitles,
      totalCount: this.OptimoProductTypeTitles.length,
    });
  };

  getProductTypeById = (id: string): Observable<any> => {
    return of(this.OptimoProductTypeTitles.find((el) => el.id === id));
  };

  getCompanyTypes = (state: any): Observable<any> => {
    return of({
      data: this.CompanyTypeTitles,
      totalCount: this.CompanyTypeTitles.length,
    });
  };

  getCompanyTypeById = (id: string): Observable<any> => {
    return of(this.CompanyTypeTitles.find((el) => el.id === id));
  };

  getPackageTypes = (state: any): Observable<any> => {
    return of({
      data: this.PackageTypeTitles,
      totalCount: this.PackageTypeTitles.length,
    });
  };

  getPackageTypeById = (id: string): Observable<any> => {
    return of(this.PackageTypeTitles.find((el) => el.id === id));
  };

  onLegalEntityAdd(): void {
    console.log('dev => legal-entity-detail => onLegalEntityAdd');
    this.dialog
      .open(UserDetailComponent, {
        width: '548px',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) this.form.controls?.userId.setValue(res);
      });
  }

  onLegalEntityChange(event): void {
    if (!event) return;
    this.INN = event.id !== ECompanyType.Individual.toString() ? true : false;
    this.updateValidity();
  }

  private updateValidity(): void {
    if (this.INN) {
      this.form
        .get('identificationNumber')
        .setValidators([
          Validators.required,
          CustomValidators.maxLengthNumber(9),
        ]);
    } else {
      this.form
        .get('identificationNumber')
        .setValidators([
          Validators.required,
          CustomValidators.maxLengthNumber(11),
        ]);
    }
    this.form.get('identificationNumber').updateValueAndValidity();
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }
}
