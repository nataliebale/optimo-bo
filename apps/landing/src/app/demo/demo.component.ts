import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ClientService, GoogleAnalyticsService } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
})
export class DemoComponent implements OnDestroy {
  isShownErrorPopup: boolean;
  isSuccess: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private googleAnalytics: GoogleAnalyticsService,
    public translateService: TranslateService
  ) {}

  onSubmit(body: any): void {
    this.client
      .post('demorequests', body)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this.isSuccess = true;
          this.googleAnalytics.sendEvent('request_order', 'request_sent');
        },
        () => {
          this.isShownErrorPopup = true;
        }
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
