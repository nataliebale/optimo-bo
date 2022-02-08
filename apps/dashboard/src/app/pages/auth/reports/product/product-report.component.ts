import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';

@Component({
  selector: 'app-product-report',
  templateUrl: './product-report.component.html',
  styleUrls: ['./product-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductReportComponent implements OnInit, OnDestroy {
  private _stockItemId: number;

  set stockItemId(value: number) {
    this._stockItemId = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { stockItemId: value },
        queryParamsHandling: 'merge',
      });
    }
  }

  get stockItemId(): number {
    return this._stockItemId;
  }

  stockItem: any;

  private _year: number;

  set year(value: number) {
    this._year = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { year: value },
        queryParamsHandling: 'merge',
      });
    }
  }

  get year(): number {
    return this._year;
  }

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ stockItemId, year }) => {
        if (stockItemId) {
          this.stockItemId = +stockItemId;
        }
        if (year) {
          this.year = +year;
        }
        this.cdr.markForCheck();
      });
  }

  getStockitems = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [StockItemStatuses.Enabled.toString(), StockItemStatuses.Disabled.toString()],
        withTypeFlag: StockItemType.Product.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client.get('stockitems', { params });
  };

  getStockitemById = (id: number): Observable<any> => {
    return this.client.get(`stockitems/${id}`);
  };

  onStockitemChange(stockItem: any): void {
    this.stockItem = stockItem;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
