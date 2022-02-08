import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { StorageService } from '@optimo/core';
import { Subject, EMPTY, OperatorFunction } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-verify-token',
  templateUrl: './verify-token.component.html',
  styleUrls: ['./verify-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyTokenComponent implements OnInit, OnDestroy {
  isLoading = true;
  type: number;
  private _sentSuccessfully: boolean;

  set sentSuccessfully(value: boolean) {
    this._sentSuccessfully = value;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  get sentSuccessfully(): boolean {
    return this._sentSuccessfully;
  }
  private token: string;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private notificator: NotificationsService,
    private activatedRoute: ActivatedRoute,
    private storage: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.params.token;
    this.type = +this.activatedRoute.snapshot.params.type;

    this.verifyUser();
  }

  private async verifyUser() {
    const requestBody = {
      token: this.token,
    };

    if (this.type === 2) {
      await this.client
        .post('user/ConfirmChangeEmail', requestBody, { service: Service.Auth })
        .pipe(this.requestPipeline)
        .subscribe(() => {
          this.sentSuccessfully = true;
        });
    } else {
      this.client
        .post('User/VerifyUser', requestBody, { service: Service.Auth })
        .pipe(this.requestPipeline)
        .subscribe((result) => {
          this.saveToken(result);
          this.notificator.saySuccess('ვერიფიკაცია წარმატებით განხორციელდა');
          this.sentSuccessfully = true;
        });
    }
  }

  private get requestPipeline(): OperatorFunction<any, any> {
    return (
      catchError(() => {
        this.sentSuccessfully = false;
        return EMPTY;
      }),
      takeUntil(this.unsubscribe$)
    );
  }

  private saveToken({ accessToken }): void {
    this.storage.setAccessToken(accessToken);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
