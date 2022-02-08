import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ClientService } from '@optimo/core';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { userStatusData } from '../../../core/enums/user.enum';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { NotificationsService } from './../../../core/services/notifications/notifications.service';
import { SupplierUserDetailComponent } from './detail/supplier-user-detail.component';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

enum ESupplierUserType {
  Active = 0,
  Suspended = 1,
}

@Component({
  selector: 'app-supplier-users',
  templateUrl: './supplier-users.component.html',
  styleUrls: ['./supplier-users.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierUsersComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {
    sortField: 'createDate',
    sortOrder: 'DESC',
  };

  SupplierUserTypeData = {
    [ESupplierUserType.Active]: 'აქტიური',
    [ESupplierUserType.Suspended]: 'დაბლოკილი',
  };

  displayedColumns: ColumnData[] = [
    {
      dataField: 'fullName',
      columnType: ColumnType.Text,
      caption: 'სახელი, გვარი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'emailOrPhoneNumber',
      columnType: ColumnType.Text,
      caption: 'საკონტაქტო ინფორმაცია',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'supplierStatus',
      columnType: ColumnType.Dropdown,
      caption: 'მდგომარეობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: this.SupplierUserTypeData,
    },
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'მომწოდებელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: userStatusData,
    },
    {
      dataField: 'createDate',
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

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private dialog: MatDialog,
    private notifier: NotificationsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('მომხმარებლები');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goToEdit(userId: string): void {
    this.dialog
      .open(SupplierUserDetailComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
        data: userId,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) this.fetchItems(this.curTableState);
      });
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
      .delete(`supplieruser`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onEditSelected(): void {
    if (this.selectedRows.length !== 1) {
      return;
    }
    this.goToEdit(this.selectedRows[0].id);
  }

  onTableStateChanged(newTableState: ITableState): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    const params = new HttpParams({
      fromObject: {
        SortField:
          tableState.sortField === 'emailOrPhoneNumber'
            ? 'email'
            : tableState.sortField,
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.fullName && { fullName: tableState.fullName }),
        ...(tableState.supplierName && {
          supplierName: tableState.supplierName,
        }),
        ...(tableState.emailOrPhoneNumber && {
          emailOrPhoneNumber: tableState.emailOrPhoneNumber,
        }),
        ...(tableState.supplierStatus && {
          supplierStatus: tableState.supplierStatus,
        }),
        ...(tableState.createDateFrom && {
          createDateFrom: tableState.createDateFrom,
        }),
        ...(tableState.createDateTo && {
          createDateTo: tableState.createDateTo,
        }),
      },
    });
    this.client
      .get<IChunkedResponse<any>>('supplieruser', { params })
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.datasource = data.data;
          this.totalCount = data.totalCount;
          this.cdr.markForCheck();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  goToAdd() {
    this.dialog
      .open(SupplierUserDetailComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
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
