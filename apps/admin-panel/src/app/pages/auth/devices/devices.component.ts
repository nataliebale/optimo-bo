import { userTypeData } from './../../../core/enums/user.enum';
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
import { Router } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { debounceTime, takeUntil, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { userStatusData } from '../../../core/enums/user.enum';
import { NotificationsService } from './../../../core/services/notifications/notifications.service';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'legalEntity',
      columnType: ColumnType.Text,
      caption: 'Legal Entity',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'deviceSerialNumber',
      columnType: ColumnType.Text,
      caption: 'სერიული ნომერი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'isLockedOut',
      columnType: ColumnType.Dropdown,
      caption: 'მდგომარეობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: userStatusData,
    },
    {
      dataField: 'lastLoginDate',
      columnType: ColumnType.Date,
      caption: 'ბოლო დალოგინება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'optimoVersion',
      columnType: ColumnType.Text,
      caption: 'ვერსია',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: {
        0: 'pending',
        1: 'registered',
        2: 'deleted',
        3: 'password registered pending',
      },
    },
    {
      dataField: 'creationDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  datasource: any[] = [];
  totalCount = 0;
  isAllSelected: boolean;
  private openedView: MatDialogRef<any, any>;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private dialog: MatDialog,
    private notifier: NotificationsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('მოწყობილობები');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  onGetViewAsLink(id: string): void {
    this.client
      .get(`devices/viewas?id=${id}`)
      .pipe(
        catchError(() => {
          this.notifier.sayError('მოწყობილობის ლინკი ვერ დაგენერირდა');
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (result && result.url) {
          window.open(result.url, '_blank');
          return;
        }
        // result.Cookies.Append(_authConfig.CookieName, token.RefreshToken, new CookieOptions
        //   {
        //       Domain = _authConfig.CookieDomain,
        //       HttpOnly = true,
        //       Expires = DateTimeOffset.Now.AddDays(7),
        //       SameSite = SameSiteMode.None
        //   });
        this.notifier.sayError('მოწყობილობის ლინკი ვერ დაგენერირდა');
      });
  }

  openRemovalDialog(rows?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '400px',
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.deleteAndRefreshItems(rows);
        }
      });
  }

  protected deleteAndRefreshItems(rows?: any): void {
    const requestBody = {
      ids: rows
        .filter((singleItem) => singleItem)
        .map((singleItem) => singleItem.id as string),
    };

    this.client
      .delete(`devices`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('ჩანაწერი წარმატებით წაიშალა');
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onLock(): void {
    this.client
      .put<any>(`devices/lock`, { id: this.selectedRows[0].id })
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onUnlock(): void {
    this.client
      .put<any>(`devices/unlock`, { id: this.selectedRows[0].id as string })
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.fetchItems(this.curTableState as ITableState);
      });
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

        ...(tableState.name && { IdOrUserName: tableState.name }),
        ...(tableState.legalEntity && {
          LegalEntity: tableState.legalEntity,
        }),
        ...(tableState.isLockedOut && { IsLocked: tableState.isLockedOut }),
        ...(tableState.status && { Status: tableState.status }),
        ...(tableState.lastLoginDateFrom && {
          LastLoginDateFrom: tableState.lastLoginDateFrom,
        }),
        ...(tableState.lastLoginDateTo && {
          LastLoginDateTo: tableState.lastLoginDateTo,
        }),
        ...(tableState.optimoVersion && { Version: tableState.optimoVersion }),
        ...(tableState.creationDateFrom && {
          CreationDateFrom: tableState.creationDateFrom,
        }),
        ...(tableState.creationDateTo && {
          CreationDateTo: tableState.creationDateTo,
        }),
        ...(tableState.deviceSerialNumber && {
          DeviceSerialNumber: tableState.deviceSerialNumber,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('devices', { params })
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
