import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { CustomValidators } from './../../../../../../../dashboard/src/app/core/helpers/validators/validators.helper';
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
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject, Observable } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { ErrorCode } from 'apps/admin-panel/src/app/core/enums/error-codes.enum';
@Component({
  selector: 'app-distributor-detail',
  templateUrl: './distributor-detail.component.html',
  styleUrls: ['./distributor-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributorDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editSupplier: any;
  isSubmited: boolean;
  businessTypes: any;

  private errorMessages = {
    email: 'შეიყვანეთ სწორი ელ.ფოსტის მისამართი',
    phoneNumber: 'შეიყვანეთ მინიმუმ 9 ციფრი',
    bankAccountNumber: 'შეიყვანეთ მინიმუმ 22 ციფრი',
  };
  logoName: any;
  imageName: any;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<DistributorDetailComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private router: Router,
    public dialog: MatDialog,
    public notifier: NotificationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  createForm(Supplier?: any) {
    this.form = this.fb.group({
      name: [Supplier && Supplier.name, [Validators.required]],
      inn: [
        Supplier && Supplier.inn,
        [
          Validators.required,
          Validators.pattern(/(^[0-9]{9}$)|(^[0-9]{11}$)/),
          CustomValidators.OnlyNumbers,
        ],
      ],
      contactName: [Supplier && Supplier.contactName],
      phoneNumber: [
        Supplier && Supplier.phoneNumber,
        [Validators.required, CustomValidators.PhoneNumber],
      ],
      email: [
        Supplier && Supplier.email,
        [Validators.required, CustomValidators.Email],
      ],
      bankAccountNumber: [
        Supplier && Supplier.bankAccountNumber,
        [Validators.minLength(22)],
      ],
      isVATRegistered: [(Supplier && Supplier.isVATRegistered) || false],
      businessTypes: [
        Supplier && Supplier.businessTypes,
        [Validators.required],
      ],
      imageId: [Supplier && Supplier.imageId],
      imageName: [Supplier && Supplier.imageUrl],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.location.back();
  }

  getItemForEdit(): void {
    this.clientService
      .get(`supplier/single?id=${this.editId}`)
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
        console.log('sypplier -> ', result);
        this.editSupplier = result;
        this.imageName = result.imageUrl;
        this.createForm(result);
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss('/suppliers');
  }

  async onSubmit() {
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }

    const formRawValues = this.form.getRawValue();
    const requestBody = {
      id: this?.editSupplier?.id,
      name: formRawValues.name,
      phoneNumber: formRawValues.phoneNumber,
      email: formRawValues.email,
      bankAccountNumber: formRawValues.bankAccountNumber,
      INN: formRawValues.inn,
      contactName: formRawValues.contactName,
      businessTypes: formRawValues.businessTypes
        ? formRawValues.businessTypes
        : [],
      IsVATRegistered: formRawValues.isVATRegistered,
      imgId: formRawValues.imageId,
      // logoName: formRawValues.logoName,
    };

    if (this.editId) {
      this.clientService
        .put<any>(`supplier`, requestBody)
        .pipe(
          catchError((err) => {
            if (err && err.error && err.error.code) {
              this.getErrorNotified(err.error.code);
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
            return;
          }
          this.bottomSheetRef.dismiss('/suppliers');
        });
    } else {
      this.clientService
        .post<any>('supplier', requestBody)
        .pipe(
          catchError((err) => {
            if (err && err.error && err.error.code) {
              this.getErrorNotified(err.error.code);
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          this.bottomSheetRef.dismiss('/suppliers');
        });
    }
  }

  getErrorNotified(code: Number): void {
    switch (code) {
      case ErrorCode.INNAlreadyExists:
        this.notifier.sayError(
          'მომწოდებელი ამ საიდენტიფიკაციო კოდით უკვე არსებობს'
        );
        break;
      case ErrorCode.PhoneNumberExists:
        this.notifier.sayError('მომწოდებელი ამ ნომრით უკვე არსებობს');
        break;
      case ErrorCode.EmailExists:
        this.notifier.sayError('მომწოდებელი ამ ელ. ფოსტით უკვე არსებობს');
        break;
      default:
      // this.notifier.sayError('ზოგადი შეცდომა');
    }
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
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

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.dirty && control.errors && !control.errors.required;
  }

  onClose() {
    console.log('SupplierDetailComponent -> onCancel -> this.form', this.form);
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

  getErrorMessage(controlName: string): string {
    return this.errorMessages[controlName];
  }

  onPhotoUploaded(event: any, uploadImageType) {
    // console.log(event);
    const imageControl = this.form.get('imageId');
    this.form.get('imageName').setValue(event.fileName);
    this.imageName = event.fileName;

    imageControl.setValue(event.response);
    imageControl.markAsDirty();
    console.log('picture set:', imageControl.value);
  }
}
