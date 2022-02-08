import { pickBy } from 'lodash-es';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseListComponent } from '../base-list.component';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { approveAction } from '@optimo/ui-popups-approve-dialog';
import { DetailPopupComponent } from './detail-popup/detail-popup.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-glovo-subcategories',
  templateUrl: './glovo-subcategories.component.html',
  styleUrls: ['./glovo-subcategories.component.scss'],
})
export class GlovoSubcategoriesComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  isUploadDropdownActive: boolean;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'subCategoryName',
      columnType: ColumnType.Text,
      caption: 'GLOVO_SUBCATEGORIES.LIST.TABLE_COLUMNS.SUBCATEGORY_NAME',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'mainCategoryName',
      columnType: ColumnType.Text,
      caption: 'GLOVO_SUBCATEGORIES.LIST.TABLE_COLUMNS.MAIN_CATEGORY_NAME',
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
    public translate: TranslateService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Glovo Subcategories');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get<any>('stockitemcategories/subcategories', {
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
      row && row.subCategoryId
        ? { ids: [row.subCategoryId] }
        : {
            ids: this.getIdsOfSelectedItems(),
          };
    return this.client.delete('stockitemcategories', data);
  }

  getIdsOfSelectedItems(): number[] {
    return this.selectedRows
      .filter((singleItem) => singleItem)
      .map((singleItem) => singleItem.subCategoryId);
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
              message: 'GLOVO_SUBCATEGORIES.DELETE_MESSAGE',
              //   approveBtnLabel: 'DefaultApproveDialog.yes',
              //   denyBtnLabel: 'DefaultApproveDialog.no',
              // },
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row))
      )
      .subscribe((res) => {
        this.notificator.saySuccess(
          this.translate.instant(
            'GLOVO_SUBCATEGORIES.RECORD_DELETE_SUCCESSFULLY'
          )
        );
        this.requestItems.next();
      });
  }

  onOpenDetailPopup(row?: any): void {
    console.log(2222222222, row);
    const id =
      (row && row.subCategoryId) ||
      (this.selectedRows &&
        this.selectedRows[0] &&
        this.selectedRows[0].subCategoryId);

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
}
