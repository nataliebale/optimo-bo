import { userTypeData } from './../../../core/enums/user.enum';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Inject,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
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
import { UserDetailComponent } from './detail/user-detail.component';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit, OnDestroy {
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
      dataField: 'emailOrPhoneNumber',
      columnType: ColumnType.Text,
      caption: 'კონტაქტის ინფო',
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
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      // columnType: ColumnType.Text,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: userTypeData,
    },
    {
      dataField: 'creationDate',
      columnType: ColumnType.Date,
      caption: 'თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    // {
    //   dataField: 'view',
    //   columnType: ColumnType.Text,
    //   caption: 'view as',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 0.8,
    // },
    // {
    //   dataField: 'extra',
    //   columnType: ColumnType.Text,
    //   caption: '',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 0.5,
    // },
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
    private notifier: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('მომხმარებლები');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  onLockStatusChange(isLockedOut){
    if(isLockedOut){
      this.onUnlock();
    }else{
      this.onLock();
    }
    this.selectedRows = [];
  }
  // onGetViewAsLink(id: string): void {
  //   this.client
  //     .get(`users/viewas?id=${id}`)
  //     .pipe(
  //       catchError(() => {
  //         this.notifier.sayError('მომხმარებლის ლინკი ვერ დაგენერირდა');
  //         return EMPTY;
  //       }),
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((result: any) => {
  //       if (result && result.url) {
  //         window.open(result.url, '_blank');
  //         return;
  //       }
  //       // result.Cookies.Append(_authConfig.CookieName, token.RefreshToken, new CookieOptions
  //       //   {
  //       //       Domain = _authConfig.CookieDomain,
  //       //       HttpOnly = true,
  //       //       Expires = DateTimeOffset.Now.AddDays(7),
  //       //       SameSite = SameSiteMode.None
  //       //   });
  //       this.notifier.sayError('მომხმარებლის ლინკი ვერ დაგენერირდა');
  //     });
  // }

  goToEdit(userId: string): void {
    console.log('Go to edit ->', userId);
    // this.router.navigate(['users/edit/', user.id]);
    this.dialog.open(UserDetailComponent, {
      width: '548px',
      data: userId,
    })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) this.fetchItems(this.curTableState);
      })
  }

  goViewAs(user: any): void {
    this.client
      .get(`users/viewas?id=${user.id}`)
      .pipe(
        catchError(() => {
          this.notifier.sayError('მომხმარებლის ლინკი ვერ დაგენერირდა');
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
        this.notifier.sayError('მომხმარებლის ლინკი ვერ დაგენერირდა');
      });
  }

  openRemovalDialog(rows?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
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
        .map((singleItem) => singleItem.id),
    };

    this.client
      .delete(`users`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('ჩანაწერი წარმატებით წაიშალა');
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onEditSelected(): void {
    console.log('edit selected: ', this.selectedRows);
    if (this.selectedRows.length !== 1) {
      console.log('invalid selection for edit');
      return;
    }
    // this.router.navigate(['users/edit/', this.selectedRows[0].id]);
    this.goToEdit(this.selectedRows[0].id)
  }

  onLock(): void {
    this.client
      .put<any>(`users/lock`, { userId: this.selectedRows[0].id })
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
      .put<any>(`users/unlock`, { userId: this.selectedRows[0].id as string })
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
        SortField:
          tableState.sortField === 'emailOrPhoneNumber'
            ? 'Email'
            : tableState.sortField,
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.name && { UserNameOrFullName: tableState.name }),
        ...(tableState.emailOrPhoneNumber && {
          EmailOrPhoneNumber: tableState.emailOrPhoneNumber,
        }),
        ...(tableState.status && { Status: tableState.status }),
        ...(tableState.isLockedOut && { IsLocked: tableState.isLockedOut }),
        ...(tableState.creationDateFrom && {
          CreationDateFrom: tableState.creationDateFrom,
        }),
        ...(tableState.creationDateTo && {
          CreationDateTo: tableState.creationDateTo,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('users', { params })
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

  hasRowViewAs(row: any): boolean {
    return row.status !== 2;
  }

  goToAdd() {
    this.dialog.open(UserDetailComponent, {
      width: '548px',
    })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) this.fetchItems(this.curTableState);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
