import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import {
  ClientService,
  Service,
  StorageService,
  RoutingStateService,
} from '@optimo/core';
import { Subject, EMPTY } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationsService } from '../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;

  loading: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private formBuilder: FormBuilder,
    private router: Router,
    private storage: StorageService,
    private notificator: NotificationsService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService
  ) {}

  onSubmit(): void {
    console.log('submit the form');
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    console.log('send request');

    this.clientService
      .post<any>(
        'User/SingIn',
        { ...this.loginForm.getRawValue() },
        {
          service: Service.Auth,
        }
      )
      .pipe(
        catchError((err) => {
          console.log('LoginComponent -> onSubmit -> err', err);
          this.checkError(err);
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res) => {
        if (res && res.accessToken) {
          this.setToken(
            res.accessToken
            // this.loginForm.controls.rememberMe.value
          );
          this.router.navigateByUrl(
            this.routingState.getPreviousCanceledUrlTree() || '/'
          );
          this.router.navigate(['/']);
          this.loading = false;
          console.log('login complete');
        } else {
          this.loading = false;
          this.notificator.sayError(
            'თქვენ მიერ შეყვანილი მომხმარებელი და პაროლი არცერთ ანგარიშს არ შეესაბამება.'
          );
          console.log(
            'თქვენ მიერ შეყვანილი მომხმარებელი და პაროლი არცერთ ანგარიშს არ შეესაბამება.'
          );
        }
      });
  }

  private setToken(accessToken: string): void {
    // this.storage.setRememberMe(rememberMe);
    this.storage.setAccessToken(accessToken);
  }

  checkError(err: HttpErrorResponse): void {
    console.log('checking error: ', err);
    this.loading = false;
    // this.notificator.sayError(
    //   'თქვენ მიერ შეყვანილი მომხმარებელი და პაროლი არცერთ ანგარიშს არ შეესაბამება'
    // );
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    console.log('initialize login');
    this.loading = false;
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      // rememberMe: [false], //[this.storage.getRememberMe()],
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
