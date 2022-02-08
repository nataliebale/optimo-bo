import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ReportPeriods } from 'apps/dashboard/src/app/core/enums/report-periods.enum';
import {
  endOfDay,
  startOfDay,
  startOfToday,
  endOfToday,
  format,
} from 'date-fns';
import { interval, Subject } from 'rxjs';
import { ClientService, Service, StorageService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import decode from 'jwt-decode';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  reportPeriods = ReportPeriods;
  endOfToday = endOfToday();

  private defaultDate = [startOfToday(), this.endOfToday];
  dateRange: Date[] = this.defaultDate;
  // exchangeRates: any;
  stockholdingstotals: any;

  private unsubscribe$ = new Subject<void>();

  besikiCountdown: number;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Dashboard');
    this.getDateRangeFromUrl();
  }
  getDateRangeFromUrl(): void {
    if (!this.route.snapshot.queryParams['date']) {
      const params = {
        date: format(this.dateRange[0], 'yyyy-MM-dd'),
      };
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    }
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ date }) => {
        if (date) {
          this.dateRange = [
            startOfDay(new Date(date)),
            endOfDay(new Date(date)),
          ];
        } else {
          this.dateRange = this.defaultDate;
        }
        this.cdr.markForCheck();
      });
  }

  onDateChanged(date: Date): void {
    let dateRange;
    if (!date) {
      dateRange = this.defaultDate;
    } else {
      dateRange = [startOfDay(date), endOfDay(date)];
    }
    const params = {
      date: format(dateRange[0], 'yyyy-MM-dd'),
    };
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit(): void {
    // this.client
    //   .getAuthed('reporting/dashboard/nbgexchangerates', 'inventory-service')
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(res => {
    //     this.exchangeRates = res;
    //     this.cdr.markForCheck();
    //   });

    this.client
      .get('warehouse/stockholdingstotals', {
        service: Service.Reporting,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.stockholdingstotals = res;
        this.cdr.markForCheck();
      });

    this.besikiTimer();
  }

  // setPeriod(days: number): void {
  //   this.onDateChanged([subDays(startOfToday(), days - 1), this.endOfToday]);
  // }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  //It's Last Joke.
  private besikiTimer(): void {
    const accessToken = this.storage.getAccessToken();
    const tokenPayload = decode(accessToken);
    if (
      tokenPayload.uid === '3ee7dac0-0049-4756-9d37-988c19306927' ||
      tokenPayload.uid === '9cec26f1-31d7-45a1-b5d0-16a16b6c88da'
    ) {
      this.besikiCountdown = 0;
      interval(1000)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
          this.besikiCountdown++;
          if (this.besikiCountdown > 3) {
            this.besikiCountdown = 0;
          }
          this.cdr.markForCheck();
        });
    }
  }
}
