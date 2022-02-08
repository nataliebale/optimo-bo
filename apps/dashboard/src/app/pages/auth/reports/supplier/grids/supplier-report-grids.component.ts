import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ColumnType } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { NumberColumnType } from 'projects/web/src/app/shared-components/table/column/column-templates/number-column/number-column.component';

@Component({
  selector: 'app-supplier-report-grids',
  templateUrl: './supplier-report-grids.component.html',
  styleUrls: ['./supplier-report-grids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierReportGridsComponent implements OnDestroy {
  private _supplierId: number;

  @Input()
  set supplierId(value: number) {
    this._supplierId = value;
    this.clearData();
    if (value) {
      this.getGridData();
    }
  }

  get supplierId(): number {
    return this._supplierId;
  }

  gridEntryCount = 10;

  topTenIncomeDataSource: any[];
  topTenIncomeColumns = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      caption: 'მარჟა',
      data: { type: NumberColumnType.Decimal },
    },
  ];

  topTenSoldDataSource: any[];
  topTenSoldColumns = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
    {
      dataField: 'totalSold',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
    },
  ];

  topTenPassiveDataSource: any[];
  topTenPassiveColumns = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
    },
    {
      dataField: 'totalSold',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal },
      caption: 'რაოდენობა',
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  private getGridData(): void {
    this.client
      .get<any>('reports/saleorders/stockitems/income', {
        params: new HttpParams({
          fromObject: {
            take: this.gridEntryCount.toString(),
            supplierId: this.supplierId.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.topTenIncomeDataSource = data;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/saleorders/stockitems/passive', {
        params: new HttpParams({
          fromObject: {
            supplierId: `${this.supplierId}`,
            take: `${this.gridEntryCount}`,
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.topTenPassiveDataSource = data;
        this.cdr.markForCheck();
      });

    this.client
      .get<any>('reports/saleorders/stockitems/quantity', {
        params: new HttpParams({
          fromObject: {
            supplierId: this.supplierId.toString(),
            take: this.gridEntryCount.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.topTenSoldDataSource = data;
        this.cdr.markForCheck();
      });
  }

  private clearData(): void {
    this.topTenIncomeDataSource = [];
    this.topTenPassiveDataSource = [];
    this.topTenSoldDataSource = [];
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
