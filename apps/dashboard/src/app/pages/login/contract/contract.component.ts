import { NotificationsService } from './../../../core/services/notifications/notifications.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Input,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService, Service } from '@optimo/core';
import { StorageService } from '@optimo/core';
import { Subject, Observable, timer } from 'rxjs';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';
import { takeWhile, map, takeUntil } from 'rxjs/operators';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractComponent implements OnInit, OnDestroy {
  @ViewChild('input', { static: true })
  codeInput: ElementRef;

  @Input()
  contract: { url: string; id: string };

  @Input()
  accessToken: string;

  form: FormGroup;
  codeCharsArray = ['', '', '', ''];
  error: boolean;
  canSend = true;
  timer$: Observable<string>;
  loading: boolean;
  headers: any;
  inputIsFocused: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private fileDownloadHelper: FileDownloadHelper,
    private notificator: NotificationsService,
    private client: ClientService,
    private formBuilder: FormBuilder,
    private storage: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      code: [
        {
          value: '',
          disabled: true,
        },
        [Validators.required, CustomValidators.OnlyNumbers],
      ],
    });

    this.headers = { Authorization: `Bearer ${this.accessToken}` };
  }

  onSendCode(): void {
    console.log('RequestContractAgreement -> identity -> Service.Auth');
    this.form.controls.code.enable();
    this.client
      .post<any>('User/RequestContractAgreement', null, {
        headers: new HttpHeaders(this.headers),
        service: Service.Auth,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this.notificator.saySuccess('კოდი გაიგზავნა');
          this.codeInput.nativeElement.focus();
        },
        (err) => {
          if (err && err.error && err.error.data && err.error.data.timeLeft) {
            this.startCountdown(Math.floor(err.error.data.timeLeft / 1000));
          }
        }
      );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;

    const requestBody = {
      documentId: this.contract.id,
      otp: this.form.getRawValue().code,
    };

    this.client
      .post<any>('User/SubmitContractAgreement', requestBody, {
        headers: new HttpHeaders(this.headers),
        service: Service.Auth,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (res) => {
          if (res && res.accessToken) {
            this.storage.setAccessToken(res.accessToken);
            this.router.navigate(['/']);
            this.loading = false;
          }
        },
        () => {
          this.loading = false;
          this.form.controls.code.setValue('');
          this.codeCharsArray = ['', '', '', ''];
          this.cdr.markForCheck();
        }
      );
  }

  onPDFDonwload(): void {
    this.client
      .get(null, {
        headers: new HttpHeaders(this.headers),
        responseType: 'blob',
        service: this.contract.url,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/pdf'
        );
      });
  }

  onClearError(): void {
    this.error = false;
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

  onCodeChange(code: string): void {
    const charArray = code.split('');
    this.codeCharsArray = this.codeCharsArray.map((_, i) => {
      return charArray[i] || '';
    });
  }

  get codeIsFilled(): boolean {
    return this.form.controls.code.value.length === 4;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
