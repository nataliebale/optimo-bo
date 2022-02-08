import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  Inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../../core/helpers/validators/validators.helper';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { ClientService, Service } from '@optimo/core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { LocationStatus } from 'apps/dashboard/src/app/core/enums/location-status.enum';
import { Subject, Observable, EMPTY } from 'rxjs';
import { ISubUser } from '../interfaces/ISubUserInterface';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { catchError } from 'rxjs/operators';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-add-new-user-modal',
  templateUrl: './add-sub-user-modal.component.html',
  styleUrls: ['./add-sub-user-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSubUserModalComponent implements OnInit, OnDestroy {
  private addNewUserForm: FormGroup;
  get getFormGroup() {
    return this.addNewUserForm;
  }

  private unsubscribe$ = new Subject<void>();

  requestIsSent: boolean;

  public locations: [{}];

  public selectedValues: number[];

  constructor(
    private dialogRef: MatDialogRef<AddSubUserModalComponent>,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {}

  ngOnInit() {
    this.getLocations().subscribe((locations) => {
      this.locations = locations['data'];
      this.cdr.markForCheck();
    });

    /**
     * Anyways form initialization should happend at first
     */
    this.initializeFormGroup();

    /**
     * If this.data has value, it means that user is existing and we are going to edit it
     * so the flow changes
     */
    if (this.data) {
      /**
       * Disable neccessery fields
       */
      this.disableSpecificFields();

      /**
       * Request data and set values
       */
      this.client
        .get(`user/staff/${this.data}`, {
          service: Service.Auth,
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((userData: ISubUser) => {
          /**
           * Set form values
           */
          this.addNewUserForm.patchValue({
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            email: userData.email,
          });

          /**
           * Set selected locations
           */
          this.selectedValues = this.getLocationIds(userData.permission);
        });
    }
  }

  onClose(): void {
    this.showDeclineUserInsertionNotification();
    // this.dialogRef.close();
  }

  private getLocationIds(userPermissions): Array<number> {
    let ids: number[] = [];

    userPermissions.forEach((location) => {
      ids.push(location['locationId']);
    });

    return ids;
  }

  /**
   * Just pure function for initializing the form group
   *
   */
  private initializeFormGroup(): void {
    this.addNewUserForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.PhoneNumber]],
      email: ['', [CustomValidators.Email]],
      permission: [[], Validators.required],
    });
  }

  /**
   * This function is used to disable several fields on edit mode
   */
  private disableSpecificFields(): void {
    this.addNewUserForm.get('firstName').disable();
    this.addNewUserForm.get('lastName').disable();
    this.addNewUserForm.get('phoneNumber').disable();
    this.addNewUserForm.get('email').disable();
  }

  private getParametersList(): Object {
    /**
     * Modify location array. parameter in POST call needs to be array of objects
     */
    const permissions = this.addNewUserForm
      .getRawValue()
      .permission.map((item) => ({
        locationId: item,
      }));

    /**
     * Spread it to original data
     */
    const data = {
      ...this.addNewUserForm.getRawValue(),
      permission: permissions,
    };

    if (this.data) {
      data['UserId'] = this.data;
    }

    return data;
  }

  onSubmit(): void {
    if (!this.getFormGroup.valid) {
      this.markFormGroupTouched();
      return;
    }
    const data = this.getParametersList();

    this.insertorUpdateUser(data).subscribe({
      /**
       * If success, just close the popup
       */
      next: (result) => {
        this._mixpanelService.track(
          this.data ? 'Edit Sub User (Success)' : 'Add Sub User (Success)'
        );
        this.dialogRef.close((result && result['id']) || true);
      },

      error: (err) => {
        /**
         * errorCode 29 means that the user already exists globally
         * So we should inform the creator about that.
         */
        switch (err.error.errorCode) {
          case 29:
            this.showUserExistsGlobally();
            break;

          case 38:
            this.notificator.sayError(
              this.translate.instant(
                'SUB_USERS.NOTIFICATIONS.SUB_USER_ALREADY_EXISTS'
              )
            );
            break;

          default:
            break;
        }
      },
    });
  }

  private insertorUpdateUser(userData: {}) {
    const requestIndicator: string = this.getInsertOrDeleteIndicator();
    return this.client[requestIndicator]('user/staff', userData, {
      service: Service.Auth,
      headers: { skip: 'true' },
    });
  }

  private showDeclineUserInsertionNotification(): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '510px',
        data: {
          title: this.translate.instant('DefaultApproveDialog.title'),
          message: this.translate.instant('DefaultApproveDialog.message'),
          approveBtnLabel: this.translate.instant('DefaultApproveDialog.yes'),
          denyBtnLabel: this.translate.instant('DefaultApproveDialog.no'),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((approveStatus: boolean) => {
        if (approveStatus) {
          this.dialog.closeAll();
        }
      });
  }

  private showUserExistsGlobally(): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '510px',
        data: {
          title: this.translate.instant(
            'SUB_USERS.CONFIRL_DIALOG.CONFIRM_ADD_ALREADY_PRESENT_USER_TITLE'
          ),
          message: this.translate.instant(
            'SUB_USERS.CONFIRL_DIALOG.CONFIRM_ADD_ALREADY_PRESENT_USER_MESSAGE'
          ),
          approveBtnLabel: this.translate.instant('DefaultApproveDialog.yes'),
          denyBtnLabel: this.translate.instant('DefaultApproveDialog.no'),
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((approveStatus: boolean) => {
        if (!approveStatus) {
          this.showDeclineUserInsertionNotification();
        } else {
          const data = this.getParametersList();
          data['useExistingUser'] = true;

          this.insertorUpdateUser(data).subscribe({
            next: (result) => {
              this.dialogRef.close((result && result['id']) || true);
            },
          });
        }
      });
  }

  /**
   * Because getLocations is executed outside of current component
   * it needs to be arrow functions. Arrow function shifts 'this' depending on
   * it's execution environment. It means where arrow function was called.
   * So in this case this will be binded from DynamicSelect component and this.client
   * is property of that class.
   */
  getLocations(): Observable<Object> {
    const params = new HttpParams({
      fromObject: {
        pageIndex: '0',
        sortField: 'id',
        sortOrder: 'ASC',
        pageSize: '20',
        status: LocationStatus.Enabled.toString(),
      },
    });

    return this.client.get('locations', { params });
  }

  private getInsertOrDeleteIndicator() {
    return this.data ? 'put' : 'post';
  }

  private markFormGroupTouched(): void {
    Object.values(this.addNewUserForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
