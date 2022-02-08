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
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FAQsComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: 'ID',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'კატეგორია',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'urlSlug',
      columnType: ColumnType.Text,
      caption: 'UrlSlug',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'questionGEO',
      columnType: ColumnType.Text,
      caption: 'QuestionGeo',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'questionENG',
      columnType: ColumnType.Text,
      caption: 'QuestionEng',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'questionRUS',
      columnType: ColumnType.Text,
      caption: 'QuestionRus',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'sortIndex',
      columnType: ColumnType.Text,
      caption: 'SortIndex',
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
    this.title.setTitle('FAQ');
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goToEdit(admin: any): void {
    console.log('Go to edit ->', admin);
    this.router.navigate(['faqs/edit/', admin.id]);
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
      .delete(`faqs`, requestBody)
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
    this.router.navigate(['faqs/edit/', this.selectedRows[0].id]);
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
        sortField: tableState.sortField,
        sortOrder: tableState.sortOrder,
        pageIndex: tableState.pageIndex.toString(),
        pageSize: tableState.pageSize.toString(),

        ...(tableState.id && { id: tableState.id }),
        ...(tableState.categoryName && {
          categoryName: tableState.categoryName,
        }),
        ...(tableState.urlSlug && { urlSlug: tableState.urlSlug }),
        ...(tableState.questionGEO && { questionGEO: tableState.questionGEO }),
        ...(tableState.questionENG && { questionENG: tableState.questionENG }),
        ...(tableState.questionRUS && { questionRUS: tableState.questionRUS }),
        ...(tableState.sortIndex && { sortIndex: tableState.sortIndex }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('faqs', { params })
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
