import { NotificationsService } from './../../core/services/notifications/notifications.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, StorageService, Service } from '@optimo/core';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorCode } from 'apps/dashboard/src/app/core/enums/error-codes.enum';
import { RoutingStateService } from '@optimo/core';
import { LocationService } from '../../core/services/location/location.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading: boolean;
  fieldTextType = false;
  accessToken: string;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private notificator: NotificationsService,
    private clientService: ClientService,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService
  ) {}

  ngOnInit() {
    this.storage.resetSpace();
    const params = this.route.snapshot.params;
    if (params.accessToken) {
      this.setToken(params.accessToken);
      this.router.navigate(['/']);
    }

    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required, CustomValidators.EmailOrPhone]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      console.log('invalid', this.loginForm);
      return;
    }
    this.loading = true;

    this.clientService
      .post<any>('User/SingIn', this.loginForm.getRawValue(), {
        service: Service.Auth,
      })
      .pipe(
        catchError((err) => {
          console.log('LoginComponent -> onSubmit -> err', err);
          console.error('LoginComponent -> onSubmit -> err', err);
          this.checkError(err);
          this.loading = false;
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res) => {
        if (res && res.accessToken) {
          const previousUrlTree = this.routingState.getPreviousCanceledUrlTree();
          this.setToken(res.accessToken);
          this.router.navigateByUrl(
            previousUrlTree?.toString() !== '/login' ? previousUrlTree : '/'
          );
          this.loading = false;
        } else {
          this.notificator.sayError(
            'თქვენ მიერ შეყვანილი მომხმარებელი და პაროლი არცერთ ანგარიშს არ შეესაბამება.'
          );
        }
      });
  }

  private checkError(err: HttpErrorResponse): void {
    this.loading = false;
    this.cdr.markForCheck();
    if (err.error?.errorCode === ErrorCode.PasswordResetPendingException) {
      this.storage.set('firstLogin', this.loginForm.getRawValue(), true);
      this.router.navigate(['/change-password']);
      return;
    }
  }

  private setToken(accessToken: string): void {
    this.storage.setAccessToken(accessToken);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
