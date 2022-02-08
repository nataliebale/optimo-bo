import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, StorageService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { Observable, Subject } from 'rxjs';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { pickBy } from 'lodash-es';
import { NumberColumnType } from '@optimo/ui-table';
import { BaseListComponent } from '../base-list.component';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { mapOfVATTypes } from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { InventoryImportResponsePopupComponent } from './import-response-popup/inventory-import-response-popup.component';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { LoadingPopupComponent } from 'apps/dashboard/src/app/popups/loading-popup/loading-popup.component';
import {
  approveAction,
  ApproveDialogComponent,
  DialogData,
} from '@optimo/ui-popups-approve-dialog';
import { PrintBarocdeData } from '@optimo/ui-print-barcode';
import { InventoryPricesSyncPopupComponent } from './prices-sync-popup/inventory-prices-sync-popup.component';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { ItemStatus } from 'apps/dashboard/src/app/core/enums/item-status.enum';

import { InventoryRsImportPopupComponent } from './rs-import-popup/inventory-rs-import-popup.component';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { MessagePopupComponent } from '../../../popups/message-popup/message-popup.component';
import { TranslateService } from '@ngx-translate/core';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
export interface ProductPriorityDTO {
  stockItemId: number;
  priority: number | null;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'dashboardPriority',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      hideInVisibilitySelector: true,
    },
    {
      dataField: 'photoUrl',
      columnType: ColumnType.Text,
      caption: '',
      sortable: false,
      filterable: false,
      hideInVisibilitySelector: true,
    },
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
      widthCoefficient: 330,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'suppliers',
      columnType: ColumnType.Text,
      caption: 'GENERAL.DISTRIBUTOR',
      filterable: true,
      sortable: false,
      widthCoefficient: 245,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.CATEGORY',
      filterable: true,
      sortable: true,
      widthCoefficient: 163,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
        statusFieldName: 'isLowStock',
        UOMFieldName: 'unitOfMeasurement',
        styleContent: (row: any) =>
          row.quantity < 0 ? ['font-color-red'] : [],
      },
      filterable: true,
      sortable: true,
      widthCoefficient: 163,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'INVENTORY.UNIT_COST_SHORT',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 163,
    },
    {
      dataField: 'unitPrice',
      columnType: ColumnType.Number,
      caption: 'INVENTORY.UNIT_PRICE',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
      widthCoefficient: 163,
    },
    {
      dataField: 'marginRate',
      columnType: ColumnType.Number,
      caption: 'ფასნამატი',
      data: {
        type: NumberColumnType.Percent,
        styleContent: (row: any) =>
          row.marginRate < 0 ? ['font-color-red'] : [],
      },
      filterable: true,
      sortable: true,
      widthCoefficient: 163,
    },
    {
      dataField: 'vatRateType',
      columnType: ColumnType.Dropdown,
      caption: 'GENERAL.VAT',
      filterable: true,
      sortable: true,
      data: mapOfVATTypes,
      widthCoefficient: 163,
    },
  ];

  private _print$ = new Subject<PrintBarocdeData>();
  private _ItemStatus = ItemStatus;
  readonly print$ = this._print$.asObservable();

  isUploadDropdownActive: boolean;
  isScalesDropdownActive: boolean;

  public isHorecaMode = this._storageService.isHorecaMode;
  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    private _storageService: StorageService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService,
    private locationService: LocationService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Products');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get<any>('stockitems', { params: this.requestBody });
  }

  get activatedHeaderTooltip(): string {
    const activatedRowCount = this.dataSource?.reduce(
      (accumulator, row) =>
        this.isActivated(row) ? accumulator + 1 : accumulator,
      0
    );
    if (!activatedRowCount || activatedRowCount === 0)
      return this.translate.instant('INVENTORY.ADD_TO_FAVORITES');
    // no rows selected
    else return this.translate.instant('INVENTORY.REMOVE_FROM_FAVORITES'); //some/all rows selected
  }

  get activateHeaderIcon(): string {
    const activatedRowCount = this.dataSource?.reduce(
      (accumulator, row) =>
        this.isActivated(row) ? accumulator + 1 : accumulator,
      0
    );
    if (!activatedRowCount || activatedRowCount === 0) return 'empty-star';
    //empty star
    else if (activatedRowCount === this.dataSource.length) return 'full-star';
    //full star
    else return 'outline-star'; //outline star
  }

  onActivateCol(): void {
    // console.log('bugs => activated header');
    const activatedRows = this.dataSource.filter((row) =>
      this.isActivated(row)
    );
    activatedRows.forEach(console.log);
    if (activatedRows.length === 0) {
      // activate all rows
      this.setProductPriority(
        this.dataSource?.map((row) => ({ stockItemId: row.id, priority: 1 }))
      );
    } else if (activatedRows.length <= this.dataSource.length) {
      // deactivate active rows (some or all)
      this.promptDeactivatePopup().subscribe((result) => {
        if (result) {
          this.setProductPriority(
            activatedRows?.map((row) => ({
              stockItemId: row.id,
              priority: null,
            }))
          );
        }
      });
    } else {
      console.error(
        'selected columns and data source mismatch. data:',
        this.dataSource,
        'selected:',
        this.selectedRows
      );
    }
  }

  setProductPriority(itemStatusArray: ProductPriorityDTO[]) {
    if (!itemStatusArray?.length) {
      console.error('can not sern request on 0 items');
      return;
    }
    const data = {
      stockItems: itemStatusArray,
    };

    this.client
      .put<any>('stockitems/setdashboardpriority', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  onExport(): void {
    // this.client
    //   .get<any>('stockitems/excel', {
    //     params: this.requestBody,
    //     responseType: 'blob',
    //   })
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((response: HttpResponse<Blob>) => {
    //     this.fileDownloadHelper.downloadFromResponse(
    //       response,
    //       'application/ms-excel'
    //     );
    //   });

    this._mixpanelService.track('Products Export');

    const request = this.client.get<any>(`stockitems/excel`, {
      params: this.requestBody,
      responseType: 'blob',
    });

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: this.translate.instant(
            'INVENTORY.PRODUCT_DOWNLOAD_IN_PROCESS'
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

  onPrintBarcode(): void {
    if (this.selectedRows.length === 1) {
      const { name, barcode, unitPrice } = this.selectedRows[0];
      this._print$.next({
        name: name,
        barcode: barcode,
        unitPrice: unitPrice,
      });
    } else {
      localStorage.setItem(
        'print-data',
        JSON.stringify(this.selectedRows.map((row) => row as PrintBarocdeData))
      );
      const baseUrl = '/print-barcode';
      window.open(baseUrl, '_blank');
    }
  }

  onScalesExport(value: number): void {
    // this.client
    //   .get<any>(`stockitems/export-scales?scales=${value}`, {
    //     responseType: 'blob',
    //   })
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((response: HttpResponse<Blob>) => {
    //     this.fileDownloadHelper.downloadFromResponse(
    //       response,
    //       'application/ms-excel'
    //     );
    //   });

    const request = this.client.get<any>(
      `stockitems/export-scales?scales=${value}`,
      {
        responseType: 'blob',
      }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: this.translate.instant(
            'INVENTORY.PRODUCT_DOWNLOAD_IN_PROCESS'
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
  private get requestBody(): HttpParams {
    const { name, dashboardPriority, ...state } = this.currentState;

    const data = pickBy(
      {
        barcodeOrName: name,
        dashboardPriority:
          dashboardPriority === 'null' ? -1 : dashboardPriority,
        ...state,
        status: [
          this._ItemStatus.Disabled.toString(),
          this._ItemStatus.Enabled.toString(),
        ],
        withTypeFlag: StockItemType.Product.toString(),
      },
      (val) => val || val === 0
    );

    return new HttpParams({
      fromObject: data as any,
    });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { stockItemIds: [row.id] }
        : {
            stockItemIds: this.idsOfSelectedItems,
          };
    return this.client.delete<any>('stockitems', data);
  }

  removeItems(row?: any): void {
    this.locationService
      .getLocations()
      .pipe(
        tap((locations) => console.log('dev => locations =>', locations)),
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: hasMultipleLocations
                ? 'GENERAL.APPROVE_STOCKITEM_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row))
      )
      .subscribe((res) => {
        this.notificator.saySuccess(this.translate.instant('INVENTORY.PRODUCT_DELETE_SUCCESS') );
        console.log('dev => itemsDeleted => res:', res);
        this.requestItems.next();
      });
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/inventory/edit/', id]);
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
      .put<any>('stockitems/status', payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  goToStatistics(): void {
    if (this.selectedRows && this.selectedRows.length === 1) {
      this.router.navigate(['/statistics/product'], {
        queryParams: { stockItemId: this.selectedRows[0].id },
      });
    }
  }

  getSuppliersName(suppliers: any[]): string {
    return suppliers && suppliers.map((s) => s.name).join(', \n');
  }

  getShortSuppliersName(suppliers: any[]): string {
    if (!suppliers) {
      return '';
    }
    let name = suppliers && suppliers[0].name;
    if (suppliers.length > 1) {
      name += ', ';
    }
    return name;
  }

  onPricesSync(): void {
    this.dialog
      .open(InventoryPricesSyncPopupComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: boolean) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  onImportFromRS(): void {
    this.dialog
      .open(InventoryRsImportPopupComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((months?: number) => {
        if (months) {
          this.onImport(true, months);
        }
      });
  }

  onImport(rs?: boolean, months?: number): void {
    let params: HttpParams;
    if (rs && months) {
      params = new HttpParams({
        fromObject: { lastXMonths: months.toString() },
      });
    }
    const request = this.client.get<any>(
      'stockitems/excel-import-template' + (rs ? '-rs' : ''),
      { params, responseType: 'blob' }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: this.translate.instant(
            'INVENTORY.PRODUCT_DOWNLOAD_IN_PROCESS'
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
    this.dialog.open(InventoryImportResponsePopupComponent, {
      width: '548px',
      data,
    });
  }

  onToggleActivate(row?: any): void {
    if (this.isActivated(row)) {
      this.deactivateSelectedRows(row);
      return;
    }
    this.toggleActivate(1, row);
  }

  private promptDeactivatePopup(): Observable<any> {
    return this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: this.translate.instant(
            'INVENTORY.DO_YOU_REALLY_WANT_TO_DEACTIVATE'
          ),
          approveBtnLabel: this.translate.instant('INVENTORY.BUTTON_CONFIRM'),
          denyBtnLabel: this.translate.instant('INVENTORY.BUTTON_DENY'),
        } as DialogData,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$));
  }

  private deactivateSelectedRows(row?: any): void {
    this.promptDeactivatePopup().subscribe((result) => {
      if (result) {
        this.toggleActivate(null, row);
      }
    });
  }

  private toggleActivate(priority: number, row?: any): void {
    const data =
      row && row.id
        ? { stockItems: [{ stockItemId: row.id, priority }] }
        : {
            stockItems: this.idsOfSelectedItems.map((id) => ({
              stockItemId: id,
              priority,
            })),
          };

    this.client
      .put<any>('stockitems/setdashboardpriority', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.isScalesDropdownActive = false;
    this.cdr.markForCheck();
  }

  toggleScalesDropdown(): void {
    this.isScalesDropdownActive = !this.isScalesDropdownActive;
    this.isUploadDropdownActive = false;
    this.cdr.markForCheck();
  }

  activateToggleText = (row?: any): string => {
    return this.isActivated(row)
      ? this.translate.instant('INVENTORY.REMOVE_FROM_FAVORITES')
      : this.translate.instant('INVENTORY.ADD_TO_FAVORITES');
  };

  public isActivated(row?: any): boolean {
    return (
      (row && Number.isInteger(row.dashboardPriority)) ||
      (!row &&
        this.selectedRows &&
        this.selectedRows[0] &&
        Number.isInteger(this.selectedRows[0].dashboardPriority))
    );
  }

  get isActivateToggleDisabled(): boolean {
    return (
      !this.selectedRows ||
      !this.selectedRows.length ||
      this.selectedRows.some(
        (row) =>
          Number.isInteger(row.dashboardPriority) !==
          Number.isInteger(this.selectedRows[0].dashboardPriority)
      )
    );
  }

  get isAnyReceipt(): boolean {
    return this.selectedRows?.some((row) => row.type === 3);
  }

  isRowReceipt(row: any): boolean {
    return row.type !== 3;
  }

  onMessagePopupOpen() {
    this.dialog
      .open(MessagePopupComponent, {
        width: '548px',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: boolean) => {});
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._print$.complete();
  }
}
