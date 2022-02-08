import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ColumnData, ColumnType, TableComponent } from '@optimo/ui-table';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { NumberColumnType } from '@optimo/ui-table';
import { endOfToday, formatRFC3339, endOfDay, format } from 'date-fns';
import { BaseListComponent } from '../base-list.component';
import { takeUntil } from 'rxjs/operators';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { pickBy } from 'lodash-es';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-stockholdings',
  templateUrl: './stockholdings.component.html',
  styleUrls: ['./stockholdings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockholdingsComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  endOfToday = endOfToday();
  private defaultDate = this.endOfToday;
  date: Date = this.defaultDate;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'supplierNames',
      columnType: ColumnType.Text,
      caption: 'GENERAL.DISTRIBUTOR',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.CATEGORY',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'Stockholdings.unitCost',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantity',
      columnType: ColumnType.Number,
      caption: 'Stockholdings.quantity',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
  ];

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this.getDateRangeFromUrl();
    this._mixpanelService.track('Stockholdings');
  }

  getDateRangeFromUrl(): void {
    if (!this.route.snapshot.queryParams['date']) {
      const params = {
        // date: format(this.date, 'yyyy-MM-dd'),
        date: formatRFC3339(endOfDay(this.date)),
      };
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    }
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ date }) => {
        if (date) {
          this.date = endOfDay(new Date(date));
        } else {
          this.date = this.defaultDate;
        }
        this.cdr.markForCheck();
      });
  }

  onDateChanged(date: Date): void {
    if (!date) {
      date = this.defaultDate;
    }
    const params = {
      date: formatRFC3339(endOfDay(date)),
    };
    const oldDates = {
      date: formatRFC3339(endOfDay(this.date)),
    };
    const dateChanged = JSON.stringify(oldDates) !== JSON.stringify(params);
    if (!dateChanged) {
      return;
    }
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    if (this.tableInstance) {
      this.tableInstance.loading = true;
      this.tableInstance.cdr.markForCheck();
    }
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('warehouse/stockholdings', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Stockholdings Export');
    this.client
      .get('warehouse/stockholdings/excel', {
        service: Service.Reporting,
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
  }

  private get requestBody(): HttpParams {
    const changePropName = this.currentState;
    if (this.currentState && this.currentState.stockItemName !== undefined) {
      changePropName['stockItemNameOrBarcode'] =
        changePropName['stockItemName'];
      delete changePropName['stockItemName'];
    }
    console.log(
      '🚀 ~ file: stockholdings.component.ts ~ line 171 ~ StockholdingsComponent ~ getrequestBody ~ formatRFC3339(this.date)',
      formatRFC3339(this.date)
    );
    return new HttpParams({
      fromObject: {
        date: formatRFC3339(this.date),
        ...changePropName,
      },
    });
  }
}
