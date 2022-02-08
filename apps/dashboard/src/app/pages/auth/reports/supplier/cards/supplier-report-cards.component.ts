import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { startOfYear, formatRFC3339, subYears } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-report-cards',
  templateUrl: './supplier-report-cards.component.html',
  styleUrls: ['./supplier-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierReportCardsComponent implements OnDestroy {
  private _supplierId: number;

  @Input()
  set supplierId(value: number) {
    this._supplierId = value;
    this.clearData();
    if (value) {
      this.getCardsData();
    }
  }

  get supplierId(): number {
    return this._supplierId;
  }

  currentYear = new Date().getFullYear();
  lastYear = new Date().getFullYear() - 1;

  lastYearRevenueData: any;
  currentYearRevenueData: any;

  averageSoldQuantity: number;
  averageOrderedQuantity: number;
  supplierItemsCount: number;
  closestPurchaseDate: Date;
  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getCardsData(): void {
    this.unsubscribe$.next();

    const startOfLastYear = formatRFC3339(subYears(startOfYear(Date.now()), 1));
    const startOfCurrentYear = formatRFC3339(startOfYear(Date.now()));

    this.client
      .get<any>('reports/saleorders/summary', {
        params: new HttpParams({
          fromObject: {
            dateFrom: startOfCurrentYear,
            supplierId: this.supplierId.toString(),
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
            dateFrom: startOfLastYear,
            dateTo: startOfCurrentYear,
            supplierId: this.supplierId.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.lastYearRevenueData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>(
        `reports/purchaseorders/nextexpectedreceivedate/${this.supplierId}`
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.closestPurchaseDate = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>(`reports/stockitems/count/supplier/${this.supplierId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.supplierItemsCount = res;
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.lastYearRevenueData = null;
    this.currentYearRevenueData = null;
    this.averageSoldQuantity = null;
    this.averageOrderedQuantity = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
