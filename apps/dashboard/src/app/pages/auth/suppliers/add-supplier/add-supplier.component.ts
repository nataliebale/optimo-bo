import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, StorageService } from '@optimo/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { RoutingStateService } from '@optimo/core';
import decode from 'jwt-decode';
import { MixpanelService } from '@optimo/mixpanel';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSupplierComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;
  editId: number;
  private unsubscribe$ = new Subject<void>();

  gridDataSource = [];
  isSubmited: boolean;
  requestIsSent: boolean;
  private errorMessages = {
    email: 'SUPPLIERS.ITEM.DETAILS.EMAIL_ERROR_MESSAGE',
    phoneNumber: 'SUPPLIERS.ITEM.DETAILS.PHONE_ERROR_MESSAGE',
    bankAccountNumber: 'SUPPLIERS.ITEM.DETAILS.BANK_ACCOUNT_ERROR_MESSAGE',
  };
  isAdmin: any;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddSupplierComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private client: ClientService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private storage: StorageService,
    private notificator: NotificationsService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && this.params.id ? 'Edit Supplier' : 'Add Supplier'
    );
  }

  ngOnInit(): void {
    // super.ngOnInit();
    const accessToken = this.storage.getAccessToken();
    const tokenPayload = decode(accessToken);
    this.isAdmin = tokenPayload.isAdmin;
    console.log(
      '🚀 ~ file: add-supplier.component.ts ~ line 61 ~ AddSupplierComponent ~ ngOnInit ~ isAdmin',
      this.isAdmin
    );
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  private getItemForEdit(): void {
    this.client
      .get(`suppliers/${this.editId}`)
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
        this.createForm();
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [this.item && this.item.name, Validators.required],
      inn: [
        this.item && this.item.inn,
        [
          Validators.required,
          Validators.pattern(/(^[0-9]{9}$)|(^[0-9]{11}$)/),
          CustomValidators.OnlyNumbers,
        ],
      ],
      contactName: [this.item && this.item.contactName],
      phoneNumber: [
        this.item && this.item.phoneNumber,
        [Validators.minLength(9)],
      ],
      email: [this.item && this.item.email, [CustomValidators.Email]],
      initialBalance: [
        {
          value: (this.item && this.item.initialBalance) || null,
          disabled: this.item && this.item.hasBalanceHistory && !this.isAdmin,
        },
      ],
      bankAccountNumber: [
        this.item && this.item.bankAccountNumber,
        [Validators.minLength(22)],
      ],
      isVATRegistered: [(this.item && this.item.isVATRegistered) || false],
    });
    this.cdr.markForCheck();
  }

  onCancel() {
    console.log(
      'TCL: AddSupplierComponent -> onCancel -> this.form',
      this.form
    );
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
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
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
      this.routingState.getPreviousUrlTree() || '/suppliers'
    );
  }

  onSubmit(): void {
    console.log(this.form);

    this.isSubmited = true;
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }
    const requestBody = this.form.getRawValue();
    requestBody.stockItemIds = this.gridDataSource.map((item) => item.id);

    const neededRequest = this.getNeededRequest(requestBody);

    this.requestIsSent = true;
    neededRequest.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        console.log(
          this.editId ? 'Edit Supplier (Success)' : 'Add Supplier (Success)'
        );
        this._mixpanelService.track(
          this.editId ? 'Edit Supplier (Success)' : 'Add Supplier (Success)'
        );
        this.notificator.saySuccess(
          this.translate.instant(this.editId ?  'SUPPLIERS.UPDATE_SUCCESSFULLY_MESSAGE' :  'SUPPLIERS.ADDED_SUCCESSFULLY_MESSAGE')
        );
        this.close();
      },
      error: () => {
        this.requestIsSent = false;
        this.cdr.markForCheck();
      },
    });
  }

  private getNeededRequest(requestBody: object): Observable<any> {
    if (this.editId) {
      return this.client.put('suppliers', { ...requestBody, id: this.editId });
    }

    return this.client.post('suppliers', requestBody);
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.dirty && control.errors && !control.errors.required;
  }

  getErrorMessage(controlName: string): string {
    return this.errorMessages[controlName];
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAllAsTouched();
    });
  }

  get title(): string {
    return !this.editId
      ? 'SUPPLIERS.ITEM.DETAILS.ADD_SUPPLIER'
      : 'SUPPLIERS.ITEM.DETAILS.EDIT_SUPPLIER';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
