import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { subYears, startOfYear, formatRFC3339 } from 'date-fns';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders-report-cards',
  templateUrl: './orders-report-cards.component.html',
  styleUrls: ['./orders-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersReportCardsComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  lastYear = new Date().getFullYear() - 1;
  currentYearOrdersCount: number;
  lastYearOrdersCount: number;
  ordersCount: number;
  averageOrdersPrice: number;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCardsData();
  }

  private getCardsData(): void {
    const startOfLastYear = formatRFC3339(subYears(startOfYear(new Date()), 1));
    const startOfCurrentYear = formatRFC3339(startOfYear(new Date()));

    this.client
      .get<any>('reports/purchaseorders/count', {
        params: new HttpParams({
          fromObject: {
            dateFrom: startOfLastYear,
            dateTo: startOfCurrentYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.lastYearOrdersCount = response;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/purchaseorders/count', {
        params: new HttpParams({
          fromObject: {
            dateFrom: startOfCurrentYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.currentYearOrdersCount = response;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/purchaseorders/orderlines/count/avg/perorder')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.ordersCount = response;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/purchaseorders/receivedtotalcost/avg/perorder')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.averageOrdersPrice = response;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
