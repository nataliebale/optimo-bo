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
import { EMPTY, Subject } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { CustomValidators } from '../../../../core/helpers/validators/validators.helper';
import { ROLES } from '../../../../core/enums/roles.enum';

@Component({
  selector: 'app-admin-detail',
  templateUrl: './admin-detail.component.html',
  styleUrls: ['./admin-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDetailComponent implements OnInit {
  roles = ROLES;

  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editAdmin: any;
  isSubmited: boolean;
  businessTypes: any;
  error: boolean;
  errorText: string;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<AdminDetailComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }

  createForm(admin: any) {
    this.form = this.fb.group({
      userName: [admin && admin.userName],
      role: [admin && admin.role, [Validators.required]],
      firstName: [admin && admin.firstName, [Validators.required]],
      lastName: [admin && admin.lastName, [Validators.required]],
      password: [null, [CustomValidators.minLengthNumber(8)]],
      confirmPassword: [null, [CustomValidators.minLengthNumber(8)]],
    });
    console.log('form values:', this.form.getRawValue());
    this.createNewAdminValidations();
    this.cdr.markForCheck();
  }

  onPhotoUploaded(event: any) {
    const imageControl = this.form.get('photoId');
    imageControl.setValue(event.response);
    imageControl.markAsDirty();
    console.log('picture set:', imageControl.value);
  }

  onCancel(): void {
    this.location.back();
  }

  onClose(): void {
    this.bottomSheetRef.dismiss('/admins');
  }

  getItemForEdit(): void {
    this.clientService
      .get(`admins/single?id=${this.editId}`)
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
        console.log('admin -> ', result);
        this.editAdmin = result;
        this.createForm(result);
      });
  }

  private createNewAdminValidations() {
    if (!this.editId) {
      this.form.get('userName').setValidators([Validators.required]);
      this.form
        .get('password')
        .setValidators([
          Validators.required,
          CustomValidators.minLengthNumber(8),
        ]);
      this.form
        .get('confirmPassword')
        .setValidators([
          Validators.required,
          CustomValidators.minLengthNumber(8),
        ]);
    }
    this.form.get('userName').updateValueAndValidity();
    this.form.get('password').updateValueAndValidity();
    this.form.get('confirmPassword').updateValueAndValidity();
  }

  private close(): void {
    this.bottomSheetRef.dismiss(true);
  }

  async onSubmit() {
    this.isSubmited = true;
    this.error = false;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }

    const formRawValues = this.form.getRawValue();
    let requestBody = {
      id: this?.editAdmin?.id,
      firstName: formRawValues.firstName,
      lastName: formRawValues.lastName,
      role: formRawValues.roles,
      password: formRawValues.password,
      confirmPassword: formRawValues.confirmPassword,
    };

    if (this.editId) {
      const request = {
        ...requestBody,
      };
      this.clientService
        .put<any>(`admins`, request)
        .pipe(
          catchError((res) => {
            this.getError(res.error);
            this.cdr.markForCheck();
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
      const request = {
        ...requestBody,
        userName: formRawValues.userName,
      };
      this.clientService
        .post<any>('admins', request)
        .pipe(
          catchError((res) => {
            this.getError(res.error);
            this.cdr.markForCheck();
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
    }
  }

  private getError(error): void {
    this.error = true;
    console.log('errrrrr: ', error);
    switch (error.errorCode) {
      case 0:
        this.errorText =
          'User name is invalid, can only contain letters or digits.';
        break;
      case 1:
        this.errorText = 'მომხმარებელი უკვე არსებობს მოცემული UserName-ით';
        break;
      case 2:
        this.errorText = 'პაროლები არ ემთხვევა';
        this.form
          .get('password')
          .setValidators([
            Validators.required,
            CustomValidators.minLengthNumber(8),
          ]);
        this.form
          .get('confirmPassword')
          .setValidators([
            Validators.required,
            CustomValidators.minLengthNumber(8),
          ]);
        this.form.get('password').updateValueAndValidity();
        this.form.get('confirmPassword').updateValueAndValidity();
        this.cdr.markForCheck();
        break;
      default:
        this.errorText = 'ზოგადი შეცდომა';
    }
    this.cdr.markForCheck();
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }
}
