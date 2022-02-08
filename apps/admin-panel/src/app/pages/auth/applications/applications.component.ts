import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { HttpParams } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { IApplicationRequest } from '../../../models/IApplicationRequest';

interface ITableState {
  pageIndex: number;
  length?: number;
  pageSize?: number;
  previousPageIndex?: number;
  sortField?: string;
  sortOrder?: string;
  id?: string;
  senderName?: string;
  senderPhone?: string;
  companyName?: string;
  sendDate?: string;
}
@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent implements OnInit {
  protected unsubscribe$ = new Subject<void>();

  displayedColumns: ColumnData[] = [
    {
      dataField: 'senderName',
      columnType: ColumnType.Text,
      caption: 'სახელი, გვარი',
      sortable: true,
      filterable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'senderPhone',
      columnType: ColumnType.Text,
      caption: 'მობილური',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'companyName',
      columnType: ColumnType.Text,
      caption: 'კომპანიის სახელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: 'შეთავაზების ID',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'createDate',
      columnType: ColumnType.Date,
      caption: 'გამოგზავნის თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  datasource: IApplicationRequest[] = [];

  totalCount = 0;

  curTableState = {
    pageSize: 10,
    pageIndex: 0,
    sortField: 'createDate',
    sortOrder: 'DESC',
  };

  onTableStateChanged(newTableState: ITableState) {
    console.log('table state changed:', newTableState);
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  fetchItems(tableState: ITableState) {
    console.log('fetch with state', tableState);
    const params = new HttpParams({
      fromObject: {
        SortField: tableState.sortField,
        SortOrder: tableState.sortOrder,
        PageIndex: '' + tableState.pageIndex,
        PageSize: '' + tableState.pageSize,

        ...(tableState.id && { Id: tableState.id }),
        ...(tableState.companyName && { CompanyName: tableState.companyName }),
        ...(tableState.senderName && { SenderName: tableState.senderName }),
        ...(tableState.senderPhone && { SenderPhone: tableState.senderPhone }),
        ...(tableState.sendDate && { SendDate: tableState.sendDate }),
      },
    });
    this.client
      .get<IChunkedResponse<IApplicationRequest>>('offerapplications', {
        params,
      })
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

  constructor(private client: ClientService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}
}
