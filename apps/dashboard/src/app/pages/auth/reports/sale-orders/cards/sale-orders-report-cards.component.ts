import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sale-orders-report-cards',
  templateUrl: './sale-orders-report-cards.component.html',
  styleUrls: ['./sale-orders-report-cards.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersReportCardsComponent implements OnInit, OnDestroy {
  averageRevenuePerSaleOrder: any;
  averageSoldQuantityPerSaleOrder: any;

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getCardsData();
  }

  private getCardsData(): void {
    this.client
      .get('reports/saleorders/revenue/avg/perorder')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averageRevenuePerSaleOrder = res;
        this.cdr.markForCheck();
      });

    this.client
      .get('reports/saleorders/stockitems/totalquantitysold/avg/perorder')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        this.averageSoldQuantityPerSaleOrder = res;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
