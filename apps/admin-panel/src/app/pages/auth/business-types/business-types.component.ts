import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ColumnType, ColumnData, SelectionData } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { HttpParams } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { BusinessTypeDetailComponent } from './detail/business-type-detail.component';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
  id?: string;
  name?: string;
}

@Component({
  selector: 'app-business-types',
  templateUrl: './business-types.component.html',
  styleUrls: ['./business-types.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessTypesComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  selectedRows: any[];
  private isAllSelected: boolean;

  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: 'ID',
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  datasource: any[] = [];
  totalCount = 0;

  protected requestDeleteItems?(row?: any): Observable<any>;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private dialog: MatDialog // protected notificator: NotificationsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('ბიზნეს ტიპები');
  }

  onRowClick(offerId: number) {
    console.log(offerId);
  }

  onSelectionChanged(selectionData: SelectionData) {
    console.log(selectionData);
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
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
      .delete(`businesstypes`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('ჩანაწერი წარმატებით წაიშალა');
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onEditSelected() {
    console.log('Selected Rows EDIT: ', this.selectedRows);
    if (this.selectedRows.length !== 1) {
      console.log('invalid selection for edit');
      return;
    }
    // this.router.navigate(['business-types/edit/', this.selectedRows[0].id]);
    this.goToEdit({id: this.selectedRows[0].id})
  }

  onTableStateChanged(newTableState: ITableState) {
    // merge current state with new status
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState as ITableState);
  }

  fetchItems(tableState: Partial<ITableState>) {
    console.log('fetch with state', tableState);
    const params = new HttpParams({
      fromObject: {
        SortField: tableState.sortField,
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.id && { Id: tableState.id }),
        ...(tableState.name && { Name: tableState.name }),
      },
    });
    this.client
      .get<IChunkedResponse<any>>('businesstypes', { params })
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

  goToAdd() {
    this.dialog.open(
      BusinessTypeDetailComponent,
      {
        width: '548px',
        panelClass: 'overflow-visible',
      })
    .afterClosed()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(
      res => res && this.fetchItems(this.curTableState)
    )
    console.log('go to add attribute');
  }

  goToEdit(row) {
    this.dialog.open(
      BusinessTypeDetailComponent,
      {
        data: {id: row.id},
        width: '548px',
        panelClass: 'overflow-visible',
      })
    .afterClosed()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(
      res => res && this.fetchItems(this.curTableState)
    )
    console.log('go to edit attribute');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
