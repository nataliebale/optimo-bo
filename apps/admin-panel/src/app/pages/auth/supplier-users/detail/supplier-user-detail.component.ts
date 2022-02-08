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
import { SupplierUserDetailModule } from './supplier-user-detail.module';

@Component({
  selector: 'app-supplier-user-detail',
  templateUrl: './supplier-user-detail.component.html',
  styleUrls: ['./supplier-user-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierUserDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: string;
  editUser: any;
  isSubmited: boolean;
  businessTypes: any;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    private notifier: NotificationsService,
    private dialogRef: MatDialogRef<SupplierUserDetailModule>,
    @Inject(MAT_DIALOG_DATA) private userId: string
  ) {}

  ngOnInit(): void {
    this.editId = this.userId && this.userId;
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
      supplierId: [User && User.supplierId, [Validators.required]],
    });
    this.cdr.markForCheck();
  }

  onClose(val: boolean): void {
    this.dialogRef.close(val);
  }

  getItemForEdit(): void {
    this.clientService
      .get(`supplieruser/single?id=${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.onClose(false);
        }
        this.editUser = result;
        this.createForm(result);
      });
  }

  async onSubmit() {
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      return;
    }

    const formRawValues = this.form.getRawValue();
    const requestBody = {
      id: this?.editUser?.id,
      firstName: formRawValues.firstName,
      lastName: formRawValues.lastName,
      phoneNumber: formRawValues.phoneNumber,
      email: formRawValues.email,
      supplierId: formRawValues.supplierId,
    };

    const request = this?.editId
      ? this.clientService.put('supplieruser', requestBody, {
          headers: new HttpHeaders({ skip: 'true' }),
        })
      : this.clientService.post('supplieruser', requestBody, {
          headers: new HttpHeaders({ skip: 'true' }),
        });

    request
      .pipe(
        catchError((err: HttpErrorResponse) => {
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
        if (result?.success === false) {
          switch (result?.code) {
            case 113:
              this.notifier.sayError(
                `მომხმარებელი ამ ელ. ფოსტით უკვე არსებობს`
              );
              break;
            case 114:
              this.notifier.sayError(`მომხმარებელი ამ ნომრით უკვე არსებობს`);
              break;

            default:
              break;
          }
          return;
        }

        this.notifier.saySuccess(
          `ჩანაწერი წარმატებით ${this?.editId ? 'განახლდა' : 'დაემატა'}`
        );
        this.onClose(true);
      });
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }

  getSuppliers = (state: any): Observable<any> => {
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

    return this.clientService.get<any>('supplier', { params });
  };

  getSuppliersById = (id: number): Observable<any> => {
    return this.clientService.get<any>(`supplier/single?id=${id}`);
  };
}
