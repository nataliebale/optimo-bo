import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ClientService, Service } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject, Observable } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { CustomValidators } from 'apps/admin-panel/src/app/core/helpers/validators/validators.helper';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserDetailModule } from './user-detail.module';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: string;
  editUser: any;
  isSubmited: boolean;
  businessTypes: any;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    private notifier: NotificationsService,
    private dialogRef: MatDialogRef<UserDetailModule>,
    @Inject(MAT_DIALOG_DATA) private userId: string
  ) {}

  ngOnInit(): void {
    this.editId = this.userId && this.userId;
    console.log('dev => user-detail => onInit => editId', this.editId);
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }

  createForm(User: any) {
    this.form = this.fb.group({
      firstName: [User && User.firstName, [Validators.required]],
      lastName: [User && User.lastName, [Validators.required]],
      phoneNumber: [
        User && User.phoneNumber,
        [Validators.required, CustomValidators.PhoneNumber],
      ],
      email: [
        User && User.email,
        [Validators.required, CustomValidators.Email],
      ],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.location.back();
  }

  onClose(userId: string | undefined = undefined): void {
    // this.bottomSheetRef.dismiss('/users');
    this.dialogRef.close(userId);
  }

  getItemForEdit(): void {
    this.clientService
      .get(`users/single?id=${this.editId}`)
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
        console.log('user -> ', result);
        this.editUser = result;
        this.createForm(result);
      });
  }

  private close(): void {
    // this.bottomSheetRef.dismiss(true);
    this.dialogRef.close(true);
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
      id: this?.editUser?.id,
      firstName: formRawValues.firstName,
      lastName: formRawValues.lastName,
      phoneNumber: formRawValues.phoneNumber,
      email: formRawValues.email,
    };

    const request = this?.editId
      ? this.clientService.put('users', requestBody, {
          headers: new HttpHeaders({ skip: 'true' }),
        })
      : this.clientService.post('users', requestBody, {
          headers: new HttpHeaders({ skip: 'true' }),
        });

    request
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.log('dev => err:', err);
          if (err.error.erroCode === 1 || err.error.erroCode === 2) {
            this.notifier.sayError('მომხმარებელი უკვე არსებობს');
          } else {
            this.notifier.sayError('დაფიქსირდა შეცდომა');
          }
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.onCancel();
        }
        this.notifier.saySuccess(
          `ჩანაწერი წარმატებით ${this?.editId ? 'განახლდა' : 'დაემატა'}`
        );
        console.log('dev => user-details => onSubmit => result', result);
        this.onClose(this?.editId ? this.editId : result?.userId?.toString());
      });
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
}
