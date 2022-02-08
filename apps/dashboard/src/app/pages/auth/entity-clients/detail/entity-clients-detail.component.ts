import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { Subject, EMPTY } from 'rxjs';
import { ClientService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil, catchError } from 'rxjs/operators';
import { RoutingStateService } from '@optimo/core';
import { CustomValidators } from './../../../../../../../dashboard/src/app/core/helpers/validators/validators.helper';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { MixpanelService } from '@optimo/mixpanel';

enum ControlStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  PENDING = 'PENDING',
  DISABLED = 'DISABLED',
}
@Component({
  selector: 'app-entity-clients-detail',
  templateUrl: './entity-clients-detail.component.html',
  styleUrls: ['./entity-clients-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityClientsDetailComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;
  isSubmited: boolean;
  requestIsSent: boolean;

  private editId: number;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<EntityClientsDetailComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private notificator: NotificationsService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track(
      this.params && +this.params.id ? 'Edit B2B Client' : 'Add B2B Client'
    );
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  onEntityIdStatusChange(
    status: ControlStatus,
    entityIdControl: AbstractControl
  ) {
    if (entityIdControl?.value === '') {
      entityIdControl?.markAsPristine();
      this.cdr.markForCheck();
    }
  }

  private getItemForEdit(): void {
    this.client
      .get(`entityclient/${this.editId}`)
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
    this.form = this.formBuilder.group({
      entityName: [this.item && this.item.entityName, [Validators.required]],
      entityIdentifier: [
        this.item && this.item.entityIdentifier,
        [Validators.required, Validators.minLength(9)],
      ],
      contactPerson: [this.item && this.item.contactPerson],
      phoneNumber: [
        this.item && this.item.phoneNumber,
        [Validators.minLength(9)],
      ],
      email: [this.item && this.item.email, [CustomValidators.Email]],
      bankAccount: [
        this.item && this.item.bankAccount,
        [Validators.minLength(22)],
      ],
      isVATRegistered: [this.item && this.item.isVATRegistered],
    });

    const entityIdControl: AbstractControl = this.form.get('entityIdentifier');
    entityIdControl.statusChanges.subscribe((status: ControlStatus) => {
      this.onEntityIdStatusChange(status, entityIdControl);
    });
    this.cdr.markForCheck();
  }

  createEntityClient(): void {
    this.isSubmited = true;
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();

    const requestBody = {
      id: this.editId,
      entityName: formRawValues.entityName,
      entityIdentifier: formRawValues.entityIdentifier,
      bankAccount: formRawValues.bankAccount,
      contactPerson: formRawValues.contactPerson,
      phoneNumber: formRawValues.phoneNumber,
      email: formRawValues.email,
      isVATRegistered: formRawValues.isVATRegistered || false,
    };

    const request = this.editId ? this.client.put : this.client.post;

    this.requestIsSent = true;

    this.cdr.markForCheck();
    request
      .bind(this.client)('entityclient', requestBody, {
        headers: { skip: 'true' },
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this._mixpanelService.track(
            this.editId
              ? 'Edit B2B Client (Success)'
              : 'Add B2B Client (Success)'
          );
          this.close();
        },
        error: () => {
          this.notificator.sayError(
            'ENTITY_CLIENTS.ITEM.DETAILS.EXISTING_ERROR'
          );

          this.requestIsSent = false;
          this.cdr.markForCheck();
        },
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
      this.routingState.getPreviousUrlTree() || '/entity-clients'
    );
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  get title(): string {
    return this.editId
      ? 'ENTITY_CLIENTS.ITEM.DETAILS.EDIT_CLIENT'
      : 'ENTITY_CLIENTS.ITEM.DETAILS.ADD_CLIENT';
  }

  needErrorMessage(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.errors && !control.errors.required;
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
