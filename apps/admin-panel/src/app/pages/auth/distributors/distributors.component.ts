import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { Router } from '@angular/router';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ViewDistributorComponent } from './view/view-distributor.component';
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { DistributorFormImportResponsePopupComponent } from './form-import-response-popup/distributor-form-import-response-popup.component';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
  // id?: string;
  // name?: string;
  // barcode?: string;
  // category?: string;
  // businessType?: string;
  // status?: number;
  // distributor?: string;
}

@Component({
  selector: 'app-distributors',
  templateUrl: './distributors.component.html',
  styleUrls: ['./distributors.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributorsComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'nameOrInn',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
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
      widthCoefficient: 1,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'მდგომარეობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
      data: {
        0: 'აქტიური',
        1: 'დაბლოკილი',
      },
    },
    {
      dataField: 'businessTypesPlain',
      columnType: ColumnType.Text,
      caption: 'ინდუსტრიები',
      filterable: true,
      sortable: false,
      widthCoefficient: 1,
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
  private openedView: MatDialogRef<any, any>;

  isUploadDropdownActive: boolean;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private dialog: MatDialog,
    private fileDownloadHelper: FileDownloadHelper,
    private notifier: NotificationsService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('მომწოდებლები');
  }

  onRowClick(distributorId: string): void {
    this.openView(distributorId);
  }

  protected openView(id: string): void {
    if (this.openedView) {
      this.openedView.close();
    }
    try {
      this.openedView = this.dialog.open(ViewDistributorComponent, {
        width: '768px',
        data: id,
      });
      this.openedView
        .afterClosed()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((r) => {
          if (r) {
            this.fetchItems(this.curTableState as ITableState);
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

  goToEdit(distributor: any): void {
    this.router.navigate(['suppliers/edit/', distributor.id]);
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
      .delete(`supplier`, requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.fetchItems(this.curTableState as ITableState);
      });
  }

  onEditSelected(): void {
    if (this.selectedRows.length !== 1) {
      return;
    }
    this.router.navigate(['suppliers/edit/', this.selectedRows[0].id]);
  }

  onCatalogueExport(): void {
    let params: HttpParams;
    const request = this.client.get<any>(
      `supplier/excel/export?id=${this.selectedRows[0].id}`,
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
          message: 'მიმდინარეობს კატალოგის ჩამოტვირთვა',
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

  onImportTemplate(): void {
    let params: HttpParams;
    const request = this.client.get<any>('supplier/excel/import/template', {
      params,
      responseType: 'blob',
    });

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს ფორმის ჩამოტვირთვა',
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
  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.cdr.markForCheck();
  }
  private openUploadResponsePopup(data: any): void {
    this.dialog.open(DistributorFormImportResponsePopupComponent, {
      width: '510px',
      data: {
        id: this.selectedRows[0].id,
        formData: data,
      },
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
    const params = new HttpParams({
      fromObject: {
        SortField: this.getSortField(tableState.sortField),
        SortOrder: tableState.sortOrder,
        PageIndex: tableState.pageIndex.toString(),
        PageSize: tableState.pageSize.toString(),

        ...(tableState.id && { Id: tableState.id }),
        ...(tableState.nameOrInn && { nameOrInn: tableState.nameOrInn }),
        ...(tableState.emailOrPhoneNumber && {
          emailOrPhoneNumber: tableState.emailOrPhoneNumber,
        }),
        ...(tableState.businessTypesPlain && {
          businesType: tableState.businessTypesPlain,
        }),
        ...(tableState.createDateFrom && {
          CreateDateFrom: tableState.createDateFrom,
        }),
        ...(tableState.status && {
          Status: tableState.status,
        }),
        ...(tableState.createDateTo && {
          CreateDateTo: tableState.createDateTo,
        }),
      },
    });

    this.client
      .get<IChunkedResponse<any>>('supplier', { params })
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

  getSortField(sortField) {
    switch (sortField) {
      case 'emailOrPhoneNumber':
        return 'Email';
      case 'nameOrInn':
        return 'Name';
    }
    return sortField;
  }

  onSuspend(isSuspended: boolean): void {
    this.client
      .put<any>(`supplier/status`, {
        distributorId: this.selectedRows[0].id,
        suspend: isSuspended,
      })
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

  goViewAs(supplier: any): void {
    console.log(
      '🚀 ~ file: legal-entities.component.ts ~ line 170 ~ LegalEntitiesComponent ~ goViewAs ~ user',
      supplier
    );

    this.client
      .get(`supplier/viewas?id=${supplier.id}`)
      .pipe(
        catchError(() => {
          this.notifier.sayError('ლინკი ვერ დაგენერირდა');
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (result && result.value) {
          window.open(result.value, '_blank');
          return;
        }
        // result.Cookies.Append(_authConfig.CookieName, token.RefreshToken, new CookieOptions
        //   {
        //       Domain = _authConfig.CookieDomain,
        //       HttpOnly = true,
        //       Expires = DateTimeOffset.Now.AddDays(7),
        //       SameSite = SameSiteMode.None
        //   });
        // this.notifier.sayError('ლინკი ვერ დაგენერირდა');
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
