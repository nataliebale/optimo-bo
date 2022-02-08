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
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminsComponent implements OnInit, OnDestroy {
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
      dataField: 'userName',
      columnType: ColumnType.Text,
      caption: 'User Name',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'userRoles',
      columnType: ColumnType.Text,
      caption: 'როლი',
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
        3: 'password reset pending',
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

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.title.setTitle('ადმინები');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goToEdit(admin: any): void {
    console.log('Go to edit ->', admin);
    this.router.navigate(['admins/edit/', admin.id]);
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
        .map((singleItem) => singleItem.id),
    };

    this.client
      .delete(`admins`, requestBody)
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
    this.router.navigate(['admins/edit/', this.selectedRows[0].id]);
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
        SortField: this.getSortField(tableState.sortField),
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.name && { FullNameOrId: tableState.name }),
        ...(tableState.userName && {
          UserName: tableState.userName,
        }),
        ...(tableState.userRoles && { Role: tableState.userRoles }),
        ...(tableState.status && { Status: tableState.status }),
        ...(tableState.creationDateFrom && {
          CreationDateFrom: tableState.creationDateFrom,
        }),
        ...(tableState.creationDateTo && {
          CreationDateTo: tableState.creationDateTo,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('admins', { params })
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

  private getSortField(sortField) {
    switch (sortField) {
      case 'name':
        return 'firstName';
      case 'userRoles':
        return 'role';
      default:
        return sortField;
    }
  }

  isRowEditable(row: any): boolean {
    return row.status !== 2;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
