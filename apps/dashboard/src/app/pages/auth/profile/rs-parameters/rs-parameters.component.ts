import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StorageService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-rs-parameters',
  templateUrl: './rs-parameters.component.html',
  styleUrls: ['./rs-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RsParametersComponent implements OnInit, OnDestroy {
  form: FormGroup;

  private unsubscribe$ = new Subject<void>();

  passwordType = 'password';

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notify: NotificationsService,
    private fb: FormBuilder,
    private storage: StorageService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('RS Parameters');
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  private getUserDetails(): void {
    this.client
      .get('user/getuserdetails', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ legalEntityData }) => {
        const rsUser = legalEntityData && legalEntityData.rsUser;
        this.createForm(rsUser);
        this.cdr.markForCheck();
      });
  }

  private createForm(user: string): void {
    this.form = this.fb.group({
      user: [user || '', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const data = this.form.getRawValue();
    this.client
      .post('User/SetRSData', data, { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.refreshToken();
        this.notify.saySuccess('პარამეტრები წარმატებით შეინახა');
        this.form.controls.password.setValue('');
        this.form.markAsPristine();
        this.form.markAsUntouched();
      });
  }

  private refreshToken() {
    this.client
      .get<any>('User/RefreshAccessToken', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        if (response && response.accessToken) {
          this.storage.setAccessToken(response.accessToken);
        }
      });
  }

  togglePasswordType() {
    this.passwordType === 'password'
      ? (this.passwordType = 'text')
      : (this.passwordType = 'password');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
