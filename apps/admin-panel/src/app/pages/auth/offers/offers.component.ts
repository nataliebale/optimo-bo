import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  LOCALE_ID,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ColumnType, ColumnData, SelectionData } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { IOffer } from '../../../models/IOffer';
import { HttpParams } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Router } from '@angular/router';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
  companyName?: string;
  id?: string;
  category?: string;
  lastModifiedOnFrom?: string;
  lastModifiedOnTo?: string;
}

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  selectedRows: IOffer[];

  private isAllSelected: boolean;
  curTableState = {
    pageSize: 10,
    pageIndex: 0,
    sortField: 'createDate',
    sortOrder: 'DESC',
  };

  displayedColumns: ColumnData[] = [
    {
      dataField: 'logo',
      columnType: ColumnType.Text,
      caption: '',
      sortable: false,
      filterable: false,
      widthCoefficient: 0.15,
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
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: 'შეთავაზების ID',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'category',
      columnType: ColumnType.Text,
      caption: 'კატეგორია',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'lastModifiedOn',
      columnType: ColumnType.Date,
      caption: 'ბოლო განახლების თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  datasource: IOffer[] = [];
  totalCount = 0;

  onRowClick(offerId: number) {
    console.log(offerId);
  }

  onSelectionChanged(selectionData: SelectionData) {
    console.log(selectionData);
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goToEdit(offer: IOffer) {
    console.log(offer);
    this.router.navigate(['offers/edit/', offer.id]);
  }

  openRemovalDialog(offerIds: number[]) {
    console.log(offerIds);
    this.matDialog
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
          this.deleteItems(offerIds);
        }
      });
  }

  deleteItems(offerIds: number[]) {
    console.log('delete these items', offerIds);
    if (offerIds.length === 1) {
      console.log('delete single item:', offerIds[0]);
      this.client
        .delete(`offers/${offerIds[0]}`)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            console.log('ჩანაწერი წარმატებით წაიშალა');
            this.fetchItems(this.curTableState as ITableState);
            this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
          } else {
            console.log('მონაცემების წაშლა ვერ მოხერხდა');
            this.fetchItems(this.curTableState as ITableState);
            this.notificator.sayError('მონაცემების წაშლა ვერ მოხერხდა');
          }
        });
    }
  }

  onDeleteSelected() {
    console.log('delete selected: ', this.selectedRows);
    if (this.selectedRows.length > 1) {
      console.log('this feature is temporarly not supported');
    } else {
      this.deleteItems(
        this.selectedRows.map((selectedItem: IOffer) => selectedItem.id)
      );
    }
  }

  onEditSelected() {
    console.log('edit selected: ', this.selectedRows[0]);
    if (this.selectedRows.length !== 1) {
      console.log(
        'invalid selection for edit',
        'number of selected items:',
        this?.selectedRows?.length
      );
      return;
    }
    this.router.navigate(['offers/edit/', this.selectedRows[0].id]);
  }

  onTableStateChanged(newTableState: ITableState) {
    console.log('table changed:', newTableState);
    // merge current state with new status
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState as ITableState);
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
        ...(tableState.category && { Category: tableState.category }),
        ...(tableState.lastModifiedOnFrom &&
          tableState.lastModifiedOnTo && {
            LastModifiedOnFrom: tableState.lastModifiedOnFrom,
            LastModifiedOnTo: tableState.lastModifiedOnTo,
          }),
      },
    });
    this.client
      .get<IChunkedResponse<IOffer>>('offers', { params })
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

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private matDialog: MatDialog,
    private notificator: NotificationsService
  ) {}

  ngOnInit(): void {
    this.fetchItems(this.curTableState as ITableState);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
