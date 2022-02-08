import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ColumnData, ColumnType } from '@optimo/ui-table';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-demo-requests',
  templateUrl: './demo-requests.component.html',
  styleUrls: ['./demo-requests.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoRequestsComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'firstName',
      columnType: ColumnType.Text,
      caption: 'სახელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'lastName',
      columnType: ColumnType.Text,
      caption: 'გვარი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'phoneNumber',
      columnType: ColumnType.Text,
      caption: 'ტელეფონი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'email',
      columnType: ColumnType.Text,
      caption: 'ელ. ფოსტა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'companyName',
      columnType: ColumnType.Text,
      caption: 'კომპანიის დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'inn',
      columnType: ColumnType.Text,
      caption: 'INN',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'address',
      columnType: ColumnType.Text,
      caption: 'მისამართი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'requestDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
    },
  ];

  datasource: any[] = [];
  totalCount = 0;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.title.setTitle('დემო მოთხოვნები');
  }

  onTableStateChanged(newTableState: ITableState): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    console.log('fetch with state', tableState);
    const params = new HttpParams({
      fromObject: {
        SortField: tableState.sortField,
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.firstName && { FirstName: tableState.firstName }),
        ...(tableState.lastName && { LastName: tableState.lastName }),
        ...(tableState.phoneNumber && { PhoneNumber: tableState.phoneNumber }),
        ...(tableState.email && { Email: tableState.email }),
        ...(tableState.companyName && {
          CompanyName: tableState.companyName,
        }),
        ...(tableState.inn && { INN: tableState.inn }),
        ...(tableState.address && { Address: tableState.address }),
        ...(tableState.requestDateFrom && {
          RequestDateFrom: tableState.requestDateFrom,
        }),
        ...(tableState.requestDateTo && {
          RequestDateTo: tableState.requestDateTo,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('demorequests', { params })
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.datasource = data.data;
          this.totalCount = data.totalCount;
          this.cdr.markForCheck();
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
