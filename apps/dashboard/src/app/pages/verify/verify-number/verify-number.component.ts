import {
  Component,
  OnDestroy,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { StorageService } from '@optimo/core';
import { timer, Observable, Subject } from 'rxjs';
import { takeWhile, map, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CustomValidators } from '../../../core/helpers/validators/validators.helper';

@Component({
  selector: 'app-verify-number',
  templateUrl: './verify-number.component.html',
  styleUrls: ['./verify-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyNumberComponent implements OnInit, OnDestroy {
  @Input()
  userIsReseting = false;

  verifyForm: FormGroup;
  private phoneNumber: string;
  displayedPhoneNumber: string;
  canSend = true;
  timer$: Observable<string>;

  private firstSendTime: number;
  private lastSendTime: number;
  private sendCount = 0;
  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private notificator: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.phoneNumber = this.activatedRoute.snapshot.params.number;
    this.displayedPhoneNumber = this.phoneNumber.replace(/^\+?995/, '');

    this.verifyForm = this.formBuilder.group({
      token: ['', [Validators.required, CustomValidators.OnlyNumbers]],
    });
  }

  async onResend() {
    try {
      const requestBody = {
        userName: this.phoneNumber,
      };

      if (this.userIsReseting) {
        await this.client
          .post('User/PasswordResetRequest', requestBody, {
            service: Service.Auth,
          })
          .toPromise();
      } else {
        await this.client
          .post('User/ResendActivation', requestBody, { service: Service.Auth })
          .toPromise();
      }

      this.notificator.saySuccess('კოდი გაიგზავნა');
    } catch (err) {
      if (err && err.error && err.error.data && err.error.data.timeLeft) {
        this.startCountdown(Math.floor(err.error.data.timeLeft / 1000));
      }
    }
  }

  private startCountdown(startPoint = 59): void {
    this.canSend = false;
    let countDown = startPoint;
    this.timer$ = timer(0, 1000).pipe(
      takeWhile(() => {
        if (countDown < 0) {
          this.canSend = true;
          this.cdr.markForCheck();
        }
        return !this.canSend;
      }),
      map(() => {
        let seconds = countDown.toString();
        seconds = seconds.length > 1 ? seconds : `0${seconds}`;
        countDown--;

        return `00:${seconds}`;
      }),
      takeUntil(this.unsubscribe$)
    );
    this.cdr.markForCheck();
  }

  onSubmit() {
    if (this.userIsReseting) {
      this.verifyOtpForReset();
    } else {
      this.verifyOtpForValidateUser();
    }
  }

  onBack(): void {
    this.location.back();
  }

  private async verifyOtpForReset() {
    // try {
    //   const requestBody = {
    //     phoneNumber: this.phoneNumber,
    //     otp: this.verifyForm.controls.token.value,
    //   };

    //   const promise = await this.client
    //     .post<any>('User/VeirfyPasswordResetOtp', requestBody, {
    //       service: Service.Auth,
    //     })
    //     .toPromise();
    //   const verifiedOtpToken = promise.token;
    //   this.storage.setVerifiedOtpToken(verifiedOtpToken);

    //   this.router.navigate([
    //     `/reset-password/withphone/${this.phoneNumber}/verified`,
    //   ]);
    // } catch {}

    const requestBody = {
      phoneNumber: this.phoneNumber,
      otp: this.verifyForm.controls.token.value,
    };
    this.client
      .post<any>('User/VeirfyPasswordResetOtp', requestBody, {
        service: Service.Auth,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        const verifiedOtpToken = res.token;
        this.storage.setVerifiedOtpToken(verifiedOtpToken);

        this.router.navigate([
          `/reset-password/withphone/${this.phoneNumber}/verified`,
        ]);
      });
  }

  private async verifyOtpForValidateUser() {
    if (!this.verifyForm.valid) {
      return;
    }

    try {
      const requestBody = {
        userName: this.phoneNumber,
        token: this.verifyForm.controls.token.value,
      };

      const result = await this.client
        .post('User/VerifyUser', requestBody, { service: Service.Auth })
        .toPromise();

      this.saveToken(result);
      this.notificator.saySuccess('ვერიფიკაცია წარმატებით განხორციელდა');
      this.router.navigate(['/']);
    } catch {}
  }

  private saveToken(resultFromServer: any): void {
    this.storage.setAccessToken(resultFromServer.accessToken);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
