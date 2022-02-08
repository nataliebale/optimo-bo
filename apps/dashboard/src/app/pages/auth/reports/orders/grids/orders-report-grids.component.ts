import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ColumnType } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-orders-report-grids',
  templateUrl: './orders-report-grids.component.html',
  styleUrls: ['./orders-report-grids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersReportGridsComponent implements OnInit, OnDestroy {
  gridEntryCount = 10;

  topPopularSuppliersDataSource: any[];
  topPopularSuppliersColumns = [
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
  ];

  topDelaySuppliersDataSource: any[];
  topDelaySuppliersColumns = [
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getGridsData();
  }

  private getGridsData(): void {
    const params = new HttpParams({ fromObject: { take: '10' } });

    this.client
      .get<any>('reports/purchaseorders/suppliers/popular', { params })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.topPopularSuppliersDataSource = data;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/purchaseorders/suppliers/whodelaydelivery', { params })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.topDelaySuppliersDataSource = data;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
