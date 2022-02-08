import { TranslateService } from '@ngx-translate/core';
import { pickBy } from 'lodash-es';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseListComponent } from '../base-list.component';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { approveAction } from '@optimo/ui-popups-approve-dialog';
import { DetailPopupComponent } from './detail-popup/detail-popup.component';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { ImportProductsResponsePopupComponent } from './import-products-response-popup/import-products-response-popup.component';

@Component({
  selector: 'app-glovo-products',
  templateUrl: './glovo-products.component.html',
  styleUrls: ['./glovo-products.component.scss'],
})
export class GlovoProductsComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  isUploadDropdownActive: boolean;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemNameOrBarcode',
      columnType: ColumnType.Text,
      caption: 'GLOVO_PRODUCTS.LIST.TABLE_COLUMNS.NAME_OR_BARCODE',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'stockItemMainCategoryName',
      columnType: ColumnType.Text,
      caption: 'GLOVO_PRODUCTS.LIST.TABLE_COLUMNS.CATEGORY',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'stockItemSubCategoryName',
      columnType: ColumnType.Text,
      caption: 'GLOVO_PRODUCTS.LIST.TABLE_COLUMNS.SUBCATEGORY',
      filterable: true,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
    private fileDownloadHelper: FileDownloadHelper,
    public translate: TranslateService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Glovo Products');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get<any>('glovo/stock-item/list', {
        params: this.requestBody,
      })
      .pipe(
        map((res) => {
          res.data = res.data.map((item) => ({
            ...item,
          }));
          return res;
        })
      );
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : {
            ids: this.getIdsOfSelectedItems(),
          };
    return this.client.delete('glovo/stock-item', data);
  }

  getIdsOfSelectedItems(): number[] {
    return this.selectedRows
      .filter((singleItem) => singleItem)
      .map((singleItem) => singleItem.id);
  }

  private get requestBody(): HttpParams {
    const { ...state } = this.currentState;
    const data = pickBy(
      {
        ...state,
      },
      (val) => val || (val as any) === 0
    );

    return new HttpParams({
      fromObject: data as any,
    });
  }

  removeItems(row?: any): void {
    this._locationService
      .getLocations()
      .pipe(
        tap(),
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)),
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: 'GLOVO_PRODUCTS.DELETE_MESSAGE',
            },
            '575px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row))
      )
      .subscribe((res) => {
        this.notificator.saySuccess(
          this.translate.instant('GLOVO_PRODUCTS.RECORD_DELETE_SUCCESSFULLY')
        );

        this.requestItems.next();
      });
  }

  onOpenDetailPopup(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);

    this.dialog
      .open(DetailPopupComponent, {
        width: '548px',
        data: id,
        panelClass: 'overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.cdr.markForCheck();
  }

  onImport(): void {
    let params: HttpParams;
    const request = this.client.get<any>(
      'glovo/stock-item/excel-import-template',
      { params, responseType: 'blob' }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: this.translate.instant(
            'GLOVO_PRODUCTS.PRODUCT_DOWNLOAD_IN_PROCESS'
          ),
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
    this.dialog.open(ImportProductsResponsePopupComponent, {
      width: '545px',
      data,
    });
  }
}
