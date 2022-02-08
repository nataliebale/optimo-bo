import { pickBy } from 'lodash-es';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseListComponent } from '../base-list.component';
import { ClientService } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { measurementUnitsData } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { approveAction } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-receipt-templates',
  templateUrl: './receipt-templates.component.html',
  styleUrls: ['./receipt-templates.component.scss'],
})
export class ReceiptTemplatesComponent extends BaseListComponent {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME',
      filterable: true,
      sortable: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'unitOfMeasurement',
      columnType: ColumnType.Dropdown,
      caption: 'GENERAL.UNIT',
      data: measurementUnitsData,
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
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Recipe Templates');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('stockitemreceipttemplate', {
      params: this.requestBody,
    });
  }

  get anyIsUsed(): boolean {
    return this.selectedRows.some((row) => row.isInUse === true);
  }

  isRowDeletable(row): boolean {
    return row.isInUse !== true;
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/receipt-templates/edit/', id]);
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    console.log('34345', row);
    const data =
      row && row.id
        ? { templateIds: [row.id] }
        : {
            templateIds: this.idsOfSelectedItems,
          };

    return this.client.delete('stockitemreceipttemplate', data);
  }

  private get requestBody(): HttpParams {
    const data = pickBy(
      {
        ...this.currentState,
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
      },
      (val) => val || (val as any) === 0
    );

    console.log(
      new HttpParams({
        fromObject: data,
      })
    );

    return new HttpParams({
      fromObject: data,
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
                ? 'GENERAL.APPROVE_RECEIPT_TEMPLATE_DELETE_MULTIPLE_LOCATIONS'
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

  goToStatistics(): void {
    if (this.selectedRows && this.selectedRows.length === 1) {
      this.router.navigate(['/statistics/category'], {
        queryParams: { categoryId: this.selectedRows[0].id },
      });
    }
  }
}
