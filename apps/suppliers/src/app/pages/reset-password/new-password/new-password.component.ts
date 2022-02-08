import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, RoutingStateService, Service } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { PasswordStrengthService } from 'apps/dashboard/src/app/core/services/password-strength/password-strength.service';
import { StorageService } from '@optimo/core';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { Location } from '@angular/common';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCode } from '../../../core/enums/error-codes.enum';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  newPasswordForm: FormGroup;
  passwordStrength = '';

  private username: string;
  private token: string;
  accessToken: any;
  contractDocument: any;
  legalEntities: Array<{ id: string; companyName: string }>;
  password: any;

  constructor(
    private passwordStrengthService: PasswordStrengthService,
    private notificator: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private client: ClientService,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService
  ) {}

  ngOnInit(): void {
    // Takes params from route
    const params = this.activatedRoute.snapshot.params;

    // Changing password with number
    if (params.number) {
      this.username = params.number;
      this.token = this.storage.getVerifiedOtpToken();
    } else if (params.token) {
      this.token = params.token;
    }
    console.log(
      '🚀 ~ file: new-password.component.ts ~ line 59 ~ NewPasswordComponent ~ this.token',
      params,
      this.storage.getVerifiedOtpToken()
    );

    this.newPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required]],
        repeatPassword: ['', [Validators.required]],
      },
      {
        validator: CustomValidators.MustMatch('password', 'repeatPassword'),
      }
    );
  }

  passwordChanged(password: string): void {
    this.passwordStrength = this.passwordStrengthService.checkPassStrength(
      password
    );
  }

  // async onSubmit() {
  //   if (!this.newPasswordForm.valid) {
  //     return;
  //   }

  //   const requestBody = this.generateRequest();

  //   try {
  //     const result = await this.client
  //       .post<any>('User/ResetPassword', requestBody, { service: Service.Auth })
  //       .toPromise();

  //     this.saveToken(result);
  //     this.notificator.saySuccess('პაროლი წარმატებით შეიცვალა');
  //     this.router.navigate(['/']);
  //   } catch {}
  // }

  onSubmit(): void {
    if (!this.newPasswordForm.valid) {
      return;
    }

    if (!this.legalEntities) {
      const requestBody = this.generateRequest();
      this.client
        .post<any>('User/ResetPassword', requestBody, { service: Service.Auth })
        .pipe(
          catchError((err) => {
            this.checkError(err);
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (result) {
            this.saveToken(result);
            this.notificator.saySuccess('პაროლი წარმატებით შეიცვალა');
            this.router.navigate(['/']);
          } else {
            this.notificator.sayError('დაფიქსირდა შეცდომა');
          }
        });
    } else {
      console.log(
        '🚀 ~ file: new-password.component.ts ~ line 132 ~ NewPasswordComponent ~ .post<any> ~ this.newPasswordForm.getRawValue()',
        this.newPasswordForm.getRawValue()
      );
      const requestBody = {
        userName: this.username,
        password: this.password,
        legalEntityId: this.newPasswordForm.controls.legalEntityId.value,
      };

      this.client
        .post<any>('User/SingIn', requestBody, {
          service: Service.Auth,
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          console.log(
            '🚀 ~ file: new-password.component.ts ~ line 141 ~ NewPasswordComponent ~ .subscribe ~ res',
            res
          );
          if (res && res.accessToken) {
            const previousUrlTree = this.routingState.getPreviousCanceledUrlTree();
            this.saveToken(res.accessToken);
            this.router.navigateByUrl(
              previousUrlTree?.toString() !== '/login' ? previousUrlTree : '/'
            );
          } else {
            this.notificator.sayError('დაფიქსირდა შეცდომა');
          }
        });
    }
  }

  private checkError(err: HttpErrorResponse): void {
    console.log(
      '🚀 ~ file: new-password.component.ts ~ line 125 ~ NewPasswordComponent ~ checkError ~ err',
      err
    );
    this.cdr.markForCheck();
    // if (err.error?.errorCode === ErrorCode.PasswordResetPendingException) {
    //   this.storage.set('firstLogin', this.newPasswordForm.getRawValue(), true);
    //   this.router.navigate(['/change-password']);
    //   return;
    // }

    if (err.error?.errorCode === ErrorCode.MultipleLegalEntitiesException) {
      console.log(55555555555555555555);
      this.legalEntities = err.error.data.legalEntities;
      this.password = this.newPasswordForm.controls.password.value;
      this.newPasswordForm = this.formBuilder.group({
        legalEntityId: [null, [Validators.required]],
        // userName: [this.username],
      });
      this.cdr.markForCheck();
      return;
    }

    if (err.error?.errorCode === ErrorCode.ContractAgreementMissingException) {
      // this.storage.setRememberMe(this.loginForm.controls.rememberMe.value);
      this.accessToken = err.error.data.token.accessToken;
      this.contractDocument = err.error.data.document;
      this.cdr.markForCheck();
    }
  }

  onBack(): void {
    this.location.back();
  }

  private saveToken({ accessToken }): void {
    this.storage.setAccessToken(accessToken);
  }

  private generateRequest(): object {
    const request = {
      token: this.storage.getVerifiedOtpToken(),
      ...this.newPasswordForm.getRawValue(),
    };
    console.log(
      '🚀 ~ file: new-password.component.ts ~ line 170 ~ NewPasswordComponent ~ generateRequest ~ request',
      request
    );

    if (this.username) {
      return {
        username: this.username,
        ...request,
      };
    }

    return request;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
