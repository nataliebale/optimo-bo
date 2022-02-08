import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientService, GoogleAnalyticsService } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageService } from '../shared/services/language.service';
import { isPackageType } from './form/package-type.enum';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
})
export class RequestComponent implements OnDestroy {
  businessTypes: any[];
  defaultFormValues: any;
  isShownErrorPopup: boolean;
  isSuccess: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private route: ActivatedRoute,
    private googleAnalytics: GoogleAnalyticsService,
    public translateService: TranslateService
  ) {
    this.getPackageTypeFromRoute();
    this.getBusinessTypes();
  }

  onSubmit(body: any): void {
    this.client
      .post('User/RequestRegistration', body)
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

  onCloseErrorPopup(): void {
    this.isShownErrorPopup = false;
  }

  private getPackageTypeFromRoute(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ packageType }) => {
        packageType = +packageType;
        if (isPackageType(packageType)) {
          this.defaultFormValues = { packageType };
        }
      });
  }

  private getBusinessTypes(): void {
    this.client
      .get<any[]>('BusinessTypes')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.businessTypes = res;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
