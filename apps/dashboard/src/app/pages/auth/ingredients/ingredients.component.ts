import { IngredientsMigrationComponent } from './migration/ingredients-migration.component';
import { StockItemType } from './../../../core/enums/stockitem-type.enum';
import { pickBy } from 'lodash-es';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseListComponent } from '../base-list.component';
import { NumberColumnType } from '@optimo/ui-table';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { StockItemStatuses } from '../../../core/enums/stockitem-status.enum';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { ImportIngredientsResponsePopupComponent } from './import-ingredients-response-popup/import-ingredients-response-popup.component';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { approveAction } from '@optimo/ui-popups-approve-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss'],
})
export class IngredientsComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  isUploadDropdownActive: boolean;
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
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'Ingredients.List.TableColumns.categoryName',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'supplierNames',
      columnType: ColumnType.Text,
      caption: 'Ingredients.List.TableColumns.supplierNames',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'Ingredients.List.TableColumns.quantity',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'Ingredients.List.TableColumns.unitCost',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    private translate: TranslateService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    private fileDownloadHelper: FileDownloadHelper,
    router: Router,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Ingredients');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get<any>('stockitems', { params: this.requestBody })
      .pipe(
        map((res) => {
          res.data = res.data.map((item) => ({
            ...item,
            totalCost: item.quantity * item.unitCost,
          }));
          return res;
        })
      );
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
      'stockitems/excel-import-template/ingredient' + (rs ? '-rs' : ''),
      { params, responseType: 'blob' }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'Ingredients.DownloadInProgress',
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
    this.dialog.open(ImportIngredientsResponsePopupComponent, {
      width: '545px',
      data,
    });
  }

  isRowDeletable(row): boolean {
    return row.isInUse !== true;
  }

  openMigrationDialog(): void {
    this.dialog
      .open(IngredientsMigrationComponent, {
        width: '520px',
        disableClose: true,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: boolean) => {});
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/ingredients/edit/', id]);
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { stockItemIds: [row.id] }
        : {
            stockItemIds: this.idsOfSelectedItems,
          };
    return this.client.delete('stockitems', data);
  }

  private get requestBody(): HttpParams {
    const { name, dashboardPriority, ...state } = this.currentState;
    const data = pickBy(
      {
        barcodeOrName: name,
        ...state,
        suppliers: state['supplierNames'],
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString()
        ],
        withTypeFlag: StockItemType.Ingredient.toString()
      },
      (val) => val || (val as any) === 0
    );
    delete data['supplierNames'];

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
    this._mixpanelService.track('Ingredients Export');
    this.client
      .get<any>('stockitems/excel', {
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel',
          'Ingredients.xlsx'
        );
      });
  }

  removeItems(row?: any): void {
    this._locationService
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
                ? 'GENERAL.APPROVE_INGREDIENT_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row)),
      )
      .subscribe((res) => {
        this.notificator.saySuccess(
          this.translate.instant('Ingredients')['Item']['deleteSuccessMessage']
        );
        console.log('dev => itemsDeleted => res:', res);
        this.requestItems.next();
      });
  }
}
