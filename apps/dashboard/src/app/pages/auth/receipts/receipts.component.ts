import { pickBy } from 'lodash-es';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseListComponent } from '../base-list.component';
import { ClientService, StorageService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { NumberColumnType } from '@optimo/ui-table';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ItemStatus } from '../../../core/enums/item-status.enum';
import { ImportReceiptsResponsePopupComponent } from './import-receipts-response-popup/import-receipts-response-popup.component';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { approveAction } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.scss'],
})
export class ReceiptsComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'itemNames',
      columnType: ColumnType.Text,
      caption: 'GENERAL.INGREDIENTS',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.CATEGORY',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'GENERAL.COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 0.8,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      caption: 'GENERAL.UNIT_PRICE',
      filterable: true,
      sortable: true,
    },
  ];
  isUploadDropdownActive: boolean;

  private _ItemStatus = ItemStatus;

  public isHorecaMode = this._storageService.isHorecaMode;
  constructor(
    private client: ClientService,
    private _storageService: StorageService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private fileDownloadHelper: FileDownloadHelper,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Recipes');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('stockitemreceipt', { params: this.requestBody });
  }

  get anyIsUsed(): boolean {
    return this.selectedRows.some((row) => row.isInUse === true);
  }

  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.cdr.markForCheck();
  }

  onImport(rs?: boolean, months?: number): void {
    let params: HttpParams;
    if (rs && months) {
      params = new HttpParams({
        fromObject: { lastXMonths: months.toString() },
      });
    }
    const request = this.client.get<any>(
      'stockitemreceipt/excel-import-template' + (rs ? '-rs' : ''),
      { params, responseType: 'blob' }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'Receipts.DownloadReceiptsInProgress',
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
    this.dialog.open(ImportReceiptsResponsePopupComponent, {
      width: '548px',
      data,
    });
  }

  isRowDeletable(row): boolean {
    return row.isInUse !== true;
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/receipts/edit/', id]);
  }

  showHide(row: any): void {
    if (row.categoryStatus === ItemStatus.Disabled) {
      return;
    }
    const status: ItemStatus = row.status;
    const id: number = row.id;
    const payload = {
      status:
        status === this._ItemStatus.Disabled
          ? this._ItemStatus.Enabled
          : this._ItemStatus.Disabled,
      id,
    };
    this.client
      .put<any>('stockitemreceipt/status', payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { recetipIds: [row.id] }
        : {
            recetipIds: this.idsOfSelectedItems,
          };

    return this.client.delete('stockitemreceipt', data);
  }

  removeItems(row?: any): void {
    this._locationService
      .getLocations()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: hasMultipleLocations
                ? 'GENERAL.APPROVE_RECEIPT_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row))
      )
      .subscribe((res) => {
        console.log('dev => itemsDeleted => res:', res);
        this.requestItems.next();
      });
  }

  private get requestBody(): HttpParams {
    const { name, ...state } = this.currentState;

    const data = pickBy(
      {
        barcodeOrName: name,
        ...state,
        status: [
          this._ItemStatus.Disabled.toString(),
          this._ItemStatus.Enabled.toString(),
        ],
        // stockItemType: StockItemType.Ingredient.toString()
      },
      (val) => val || (val as any) === 0
    );
    return new HttpParams({
      fromObject: data as any,
    });
  }

  goToStatistics(): void {
    if (this.selectedRows && this.selectedRows.length === 1) {
      this.router.navigate(['/statistics/category'], {
        queryParams: { categoryId: this.selectedRows[0].id },
      });
    }
  }

  onExport(): void {
    this.client
      .get<any>('stockitemreceipt/excel', {
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel',
          'Receipts.xlsx'
        );
      });
  }
}
