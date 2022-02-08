import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  ColumnType,
  ColumnData,
  SelectionData,
  NumberColumnType,
} from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { CatalogueImportResponsePopupComponent } from './import-response-popup/catalogue-import-response-popup.component';
import { CatalogueImagesSyncPopupComponent } from './images-sync-popup/catalogue-images-sync-popup.component';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { ViewCatalogueComponent } from './view/view-catalogue.component';
import { catalogueStockitemStatusData } from './../../../core/enums/catalogue-stockitem-status.enum';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { pickBy } from 'lodash-es';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
  id?: string;
  name?: string;
  barcode?: string;
  category?: string;
  businessType?: string;
  status?: number;
  distributor?: string;
}

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'photoUrl',
      columnType: ColumnType.Text,
      caption: 'სურათი',
      sortable: false,
      filterable: false,
      widthCoefficient: 0.25,
    },
    {
      dataField: 'name',

      columnType: ColumnType.Text,
      caption: 'დასახელება',
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
      dataField: 'distributor',
      columnType: ColumnType.Text,
      caption: 'მომწოდებელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'თვითღირებულება',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'გასაყიდი ფასი',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    // {
    //   dataField: 'businessTypeNames',
    //   columnType: ColumnType.Text,
    //   caption: 'ინდუსტრიები',
    //   filterable: true,
    //   sortable: true,
    //   widthCoefficient: 1,
    // },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'სტატუსი',
      filterable: true,
      sortable: true,
      data: catalogueStockitemStatusData,
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
    private fileDownloadHelper: FileDownloadHelper
  ) {}

  ngOnInit(): void {
    this.title.setTitle('კატალოგი');
  }

  onRowClick(stockItemId: string): void {
    console.log(stockItemId);
    this.openView(stockItemId);
  }

  protected openView(id: string): void {
    if (this.openedView) {
      this.openedView.close();
    }
    try {
      this.openedView = this.dialog.open(ViewCatalogueComponent, {
        width: '768px',
        data: id,
      });
      this.openedView
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((r) => {
          if (r) {
            this.fetchItems(this.curTableState);
          }
          this.router.navigate([], {
            queryParamsHandling: 'merge',
            queryParams: null,
            replaceUrl: true,
          });
        });
    } catch {
      this.router.navigate([], {
        queryParamsHandling: 'merge',
        queryParams: null,
        replaceUrl: true,
      });
    }
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  goToEdit(stockItem: any): void {
    console.log('Go to edit ->', stockItem);
    this.router.navigate(['catalogue/edit/', stockItem.id]);
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
      .delete(`catalogstockitems`, requestBody)
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
    this.router.navigate(['catalogue/edit/', this.selectedRows[0].id]);
  }

  onTableStateChanged(newTableState: any): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
      barcodeOrName: newTableState?.name,
    };
    this.fetchItems(this.curTableState as ITableState);
  }

  onSync(): void {
    this.dialog
      .open(CatalogueImagesSyncPopupComponent, {
        width: '448px',
        panelClass: 'dialog-overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: boolean) => {
        this.fetchItems(this.curTableState);
      });
  }

  onImport(): void {
    let params: HttpParams;
    const request = this.client.get<any>(
      'catalogstockitems/excel/import/template',
      {
        params,
        responseType: 'blob',
      }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს პროდუქტების ჩამოტვირთვა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        if (response) {
          this.fileDownloadHelper.downloadFromResponse(
            response,
            'application/ms-excel'
          );
        }
      });
  }

  onUpload(fileList: any): void {
    const file = fileList && fileList[0];

    const formData = new FormData();
    formData.append('file', file, file.name);
    this.openUploadResponsePopup(formData);
  }

  private openUploadResponsePopup(data: FormData): void {
    this.dialog.open(CatalogueImportResponsePopupComponent, {
      width: '510px',
      data,
    });
  }

  private fetchItems(tableState: any): void {
    console.log('dev => catalogue => fetchItems => tableState', tableState);
    const params = new HttpParams({
      fromObject: pickBy(
        {
          ...tableState,
          SortField: tableState.sortField,
          SortOrder: tableState.sortOrder,
          PageIndex: tableState.pageIndex.toString(),
          PageSize: tableState.pageSize.toString(),
        },
        (val) => val && val.toString
      ),
    });

    this.client
      .get<IChunkedResponse<any>>('catalogstockitems', { params })
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
