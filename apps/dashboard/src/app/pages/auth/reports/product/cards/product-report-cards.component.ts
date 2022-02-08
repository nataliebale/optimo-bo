import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { startOfYear, endOfYear, formatRFC3339 } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';

@Component({
  selector: 'app-product-report-cards',
  templateUrl: './product-report-cards.component.html',
  styleUrls: ['./product-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReportCardsComponent implements OnDestroy {
  getUMOAcronym = getUMOAcronym;

  private _stockItem: any;

  @Input()
  set stockItem(value: any) {
    this._stockItem = value;
    this.getCardsData();
  }

  get stockItem(): any {
    return this._stockItem;
  }
  private _year: number;

  @Input()
  set year(value: number) {
    this._year = value;
    this.getCardsData();
  }

  get year(): number {
    return this._year;
  }

  saleOrdersData: any;
  averageSaleOrderData: any;
  averagePurchaseOrderData: any;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getCardsData(): void {
    this.clearData();
    if (!this.stockItem || !this.year) {
      return;
    }
    this.unsubscribe$.next();

    const startOfSelectedYear = formatRFC3339(
      startOfYear(new Date(this.year, 0))
    );
    const endOfSelectedYear = formatRFC3339(endOfYear(new Date(this.year, 0)));

    this.client
      .get<any>('sales/stockitemsalessummary', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: startOfSelectedYear,
            saleOrderDateTo: endOfSelectedYear,
            stockItemId: this.stockItem.id.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.saleOrdersData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('sales/stockitemaveragesalespermonth', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            saleOrderDateFrom: startOfSelectedYear,
            saleOrderDateTo: endOfSelectedYear,
            stockItemId: this.stockItem.id,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averageSaleOrderData = res;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reporting/stockitemaveragepurchasingperorder', {
        params: new HttpParams({
          fromObject: {
            purchaseOrderReceiveDateFrom: startOfSelectedYear,
            purchaseOrderReceiveDateTo: endOfSelectedYear,
            stockItemId: this.stockItem.id,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averagePurchaseOrderData = res;
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.saleOrdersData = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
