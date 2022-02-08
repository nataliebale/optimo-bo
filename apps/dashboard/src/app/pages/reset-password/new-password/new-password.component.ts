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
  private token: string;
  accessToken: any;
  contractDocument: any;
  legalEntities: Array<{ id: string; companyName: string }>;
  password: any;
  private number: string;
  private email: string;

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
    const params = this.activatedRoute.snapshot.params;
    if (params.number) {
      this.number = params.number;
      this.token = this.storage.getVerifiedOtpToken();
    } else if (params.token) {
      this.token = params.token;
      this.email = params.email;
    }

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

  onSubmit(): void {
    if (!this.newPasswordForm.valid) {
      return;
    }

    if (!this.legalEntities) {
      let request = {
        token: this.token,
        ...this.newPasswordForm.getRawValue(),
      };
      if (this.number) {
        request = {
          ...request,
          username: this.number,
        };
      }

      this.client
        .post<any>('User/ResetPassword', request, { service: Service.Auth })
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
      const requestBody = {
        userName: this.number || this.email,
        password: this.password,
        legalEntityId: this.newPasswordForm.controls.legalEntityId.value,
      };

      this.client
        .post<any>('User/SingIn', requestBody, {
          service: Service.Auth,
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          if (res && res.accessToken) {
            const previousUrlTree = this.routingState.getPreviousCanceledUrlTree();
            this.saveToken(res);
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
    this.cdr.markForCheck();

    if (err.error?.errorCode === ErrorCode.MultipleLegalEntitiesException) {
      this.legalEntities = err.error.data.legalEntities;
      this.password = this.newPasswordForm.controls.password.value;
      this.newPasswordForm = this.formBuilder.group({
        legalEntityId: [null, [Validators.required]],
      });
      this.cdr.markForCheck();
      return;
    }

    if (err.error?.errorCode === ErrorCode.ContractAgreementMissingException) {
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
