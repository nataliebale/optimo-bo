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
import { EventBusService } from '../../core/services/event-bus-service/event-bus.service';
import { Store } from '@ngrx/store';
import { setLaunchedByViewAs } from '../../state/app.actions';

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

  legalEntities: Array<{ id: string; companyName: string }>;
  // legalEntities: any;
  accessToken: string;
  contractDocument: any;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private notificator: NotificationsService,
    private clientService: ClientService,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private eventBus: EventBusService,
    private location: LocationService,
    private _store: Store
  ) {}

  ngOnInit() {
    this.storage.resetSpace();
    const params = this.route.snapshot.params;
    if (params.accessToken) {
      this.setToken(params.accessToken);
      this._store.dispatch(setLaunchedByViewAs())
      this.router.navigate(['/']);
    }

    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required, CustomValidators.EmailOrPhone]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      // rememberMe: [this.storage.getRememberMe()],
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
        console.log(
          '🚀 ~ file: login.component.ts ~ line 91 ~ LoginComponent ~ .subscribe ~ res',
          res
        );

        if (res && res.accessToken) {
          const previousUrlTree = this.routingState.getPreviousCanceledUrlTree();
          console.log(
            "🚀 ~ file: login.component.ts ~ line 105 ~ LoginComponent ~ .subscribe ~ '/login' ? previousUrlTree : '/'",
            '/login' ? previousUrlTree : '/'
          );

          this.setToken(res.accessToken);
          this.setInitialLocation();
          localStorage.setItem('showImportantNotification', 'true');
          this.router.navigateByUrl(
            previousUrlTree?.toString() !== '/login' ? previousUrlTree : '/'
          );
          this.location.makeLocationsEmpty();
          this.eventBus.locationsUpdated();
          // this.router.navigate(['/']);
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

    if (err.error?.errorCode === ErrorCode.MultipleLegalEntitiesException) {
      this.legalEntities = err.error.data.legalEntities;
      this.loginForm = this.formBuilder.group({
        legalEntityId: [null, [Validators.required]],
        // rememberMe: [this.loginForm.controls.rememberMe.value],
        userName: [this.loginForm.controls.userName.value],
        password: [this.loginForm.controls.password.value],
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

  private setToken(accessToken: string): void {
    // this.storage.setRememberMe(rememberMe);
    this.storage.setAccessToken(accessToken);
  }

  private setInitialLocation(): void {
    // this.location.initLocation();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
