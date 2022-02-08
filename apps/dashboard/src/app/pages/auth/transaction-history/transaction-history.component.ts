import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { TransactionTypes } from 'apps/dashboard/src/app/core/enums/transaction-types.enum';
import { PurchaseOrderViewDialogComponent } from './purchase-order-view-dialog/purchase-order-view-dialog.component';
import { SaleOrderViewDialogComponent } from './sale-order-view-dialog/sale-order-view-dialog.component';
import { ColumnType, NumberColumnType } from '@optimo/ui-table';
import { Subject, of, OperatorFunction } from 'rxjs';
import { takeUntil, debounceTime, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  dataSource: any[];

  displayedColumns = [
    {
      dataField: 'description',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'totalOrderLines',
      columnType: ColumnType.Number,
      caption: 'რაოდენობა',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'totalCostPrice',
      columnType: ColumnType.Number,
      caption: 'ღირებლება',
      filterable: false,
      data: { type: NumberColumnType.Decimal },
      sortable: true,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      data: {
        [TransactionTypes.PurchaseOrder]: 'შესყიდვა',
        [TransactionTypes.SaleOrder]: 'გაყიდვა',
      },
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: false,
      sortable: true,
    },
  ];
  totalCount: number;

  private unsubscribe$ = new Subject<void>();
  private requestTransactions = new Subject<void>();
  private currentState: { [param: string]: string };

  constructor(
    private client: ClientService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.requestTransactions
      .pipe(
        debounceTime(200),
        this.toHttpGetTransactions,
        takeUntil(this.unsubscribe$)
      )
      .subscribe(({ data, totalCount }) => {
        this.dataSource = data;
        this.totalCount = totalCount;
        this.cdr.markForCheck();
      });
  }

  private get toHttpGetTransactions(): OperatorFunction<void, any> {
    return switchMap(() => {
      return this.client
        .get('reports/orders/union', {
          params: new HttpParams({
            fromObject: {
              ...this.currentState,
            },
          }),
        })
        .pipe(
          catchError(() => of({ totalCount: 0, data: [] })),
          takeUntil(this.unsubscribe$)
        );
    });
  }

  onTableStateChanged(state: { [param: string]: string }): void {
    this.currentState = state;
    this.requestTransactions.next();
  }

  gridRowClick(data) {
    console.log('TCL: gridRowClick -> data', data);
    switch (data.type) {
      case TransactionTypes.PurchaseOrder:
        this.dialog.open(PurchaseOrderViewDialogComponent, {
          width: '800px',
          data: data.id,
        });
        break;
      case TransactionTypes.SaleOrder:
        this.dialog.open(SaleOrderViewDialogComponent, {
          width: '800px',
          data: data.id,
        });
        break;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestTransactions.complete();
  }
}
