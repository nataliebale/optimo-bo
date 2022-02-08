import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService, Service } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService } from '@optimo/core';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-profile-change-password',
  templateUrl: './profile-change-password.component.html',
  styleUrls: ['./profile-change-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileChangePasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationsService,
    private fb: FormBuilder,
    private storage: StorageService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Change Password');
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  private getUserDetails(): void {
    this.client
      .get('user/getuserdetails', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ phoneNumber, email }) => {
        this.createForm(email || phoneNumber);
        this.cdr.markForCheck();
      });
  }

  private createForm(email: string): void {
    this.form = this.fb.group(
      {
        userName: [email],
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required]],
        repeatNewPassword: ['', [Validators.required]],
      },
      {
        validator: CustomValidators.MustMatch(
          'newPassword',
          'repeatNewPassword'
        ),
      }
    );
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const data = this.form.getRawValue();
    this.client
      .post('User/ChangePassword', data, { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ accessToken }) => {
        this.saveToken(accessToken);
        this.notify.saySuccess(this.translate.instant('PROFILE.PASSWORD_CHANGE_SUCCESS'));
        this.form.markAsPristine();
      });
  }

  private saveToken(accessToken: string): void {
    this.storage.setAccessToken(accessToken);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
