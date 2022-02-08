import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import {
  formatRFC3339,
  subYears,
  endOfToday,
  startOfToday,
  startOfYesterday,
  startOfYear,
} from 'date-fns';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-revenues-report-cards',
  templateUrl: './revenues-report-cards.component.html',
  styleUrls: ['./revenues-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenuesReportCardsComponent implements OnInit, OnDestroy {
  lasyYearRevenueData: any;
  currentYearRevenueData: any;
  lastDayRevenueData: any;
  currentDayRevenueData: any;

  currentYear = new Date().getFullYear();
  lastYear = new Date().getFullYear() - 1;
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCardsData();
  }

  private getCardsData(): void {
    const startOfLastYear = formatRFC3339(subYears(startOfYear(Date.now()), 1));
    const startOfCurrentYear = formatRFC3339(startOfYear(Date.now()));

    this.client
      .get<any>('reports/saleorders/summary', {
        params: new HttpParams({
          fromObject: {
            dateFrom: startOfLastYear,
            dateTo: startOfCurrentYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.currentYearRevenueData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/saleorders/summary', {
        params: new HttpParams({
          fromObject: {
            dateFrom: startOfCurrentYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.lasyYearRevenueData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/saleorders/summary', {
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(startOfYesterday()),
            dateTo: formatRFC3339(startOfToday()),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.lastDayRevenueData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/saleorders/summary', {
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(startOfToday()),
            dateTo: formatRFC3339(endOfToday()),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.currentDayRevenueData = res;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
