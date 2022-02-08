import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { startOfYear, endOfYear, formatRFC3339 } from 'date-fns';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-general-report-cards',
  templateUrl: './general-report-cards.component.html',
  styleUrls: ['./general-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralReportCardsComponent implements OnDestroy {
  private _year: number;

  @Input()
  set year(value: number) {
    this._year = value;
    this.clearData();
    if (value) {
      this.getCardsData();
    }
  }

  get year(): number {
    return this._year;
  }

  saleOrdersData: any;
  averageSalesPerMonthData: any;
  averageSaleOrderData: any;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getCardsData(): void {
    this.unsubscribe$.next();

    const startOfSelectedYear = formatRFC3339(
      startOfYear(new Date(this.year, 0))
    );
    const endOfSelectedYear = formatRFC3339(endOfYear(new Date(this.year, 0)));

    this.client
      .get<any>('sales/salessummary', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: startOfSelectedYear,
            saleOrderDateTo: endOfSelectedYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.saleOrdersData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/averagesalespermonth', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: startOfSelectedYear,
            saleOrderDateTo: endOfSelectedYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averageSalesPerMonthData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/averagesalesperorder', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: startOfSelectedYear,
            saleOrderDateTo: endOfSelectedYear,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averageSaleOrderData = res;
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.saleOrdersData = null;
    this.averageSaleOrderData = null;
    this.averageSalesPerMonthData = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
