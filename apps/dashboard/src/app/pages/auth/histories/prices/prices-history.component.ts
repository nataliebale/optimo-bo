import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ColumnType, ColumnData, TableComponent } from '@optimo/ui-table';
import { Observable } from 'rxjs';
import { ClientService, Service } from '@optimo/core';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { NumberColumnType } from '@optimo/ui-table';
import { BaseListComponent } from '../../base-list.component';
import {
  endOfToday,
  startOfToday,
  subDays,
  formatRFC3339,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { FileDownloadHelper } from '../../../../core/helpers/file-download/file-download.helper.ts';
import { takeUntil } from 'rxjs/operators';
import { PRICES_CHANGE_TYPES_DATA } from '../../../../core/enums/prices-change-type.enum';
import { pickBy } from 'lodash-es';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { StockItemType } from '../../../../core/enums/stockitem-type.enum';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-prices-history',
  templateUrl: './prices-history.component.html',
  styleUrls: ['./prices-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricesHistoryComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];
  dateRange: Date[] = this.defaultDate;

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
      dataField: 'priceType',
      columnType: ColumnType.Dropdown,
      caption: 'PricesHistory.TableColumns.priceType',
      filterable: true,
      sortable: true,
      data: PRICES_CHANGE_TYPES_DATA,
    },
    {
      dataField: 'unitPriceBefore',
      columnType: ColumnType.Number,
      caption: 'PricesHistory.TableColumns.unitPriceBefore',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitPriceChange',
      columnType: ColumnType.Number,
      caption: 'PricesHistory.TableColumns.unitPriceChange',
      data: {
        type: NumberColumnType.Decimal,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitPriceCurrent',
      columnType: ColumnType.Number,
      caption: 'PricesHistory.TableColumns.unitPriceCurrent',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'date',
      columnType: ColumnType.Date,
      caption: 'PricesHistory.TableColumns.date',
      filterable: false,
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
    this._mixpanelService.track('Prices');
  }

  getDateRangeFromUrl(): void {
    if (!this.route.snapshot.queryParams['dateFrom']) {
      const params = {
        // dateFrom: format(this.dateRange[0], 'yyyy-MM-dd'),
        // dateTo: format(this.dateRange[1], 'yyyy-MM-dd'),
        dateFrom: formatRFC3339(this.dateRange[0]),
        dateTo: formatRFC3339(this.dateRange[1]),
      };
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    }
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo }) => {
        if (dateFrom && dateTo) {
          this.dateRange = [
            startOfDay(new Date(dateFrom)),
            endOfDay(new Date(dateTo)),
          ];
        } else {
          this.dateRange = this.defaultDate;
        }
        this.cdr.markForCheck();
      });
  }

  onDateChanged(dateRange: Date[]): void {
    if (!dateRange) {
      dateRange = this.defaultDate;
    }
    const params = {
      // dateFrom: format(dateRange[0], 'yyyy-MM-dd'),
      // dateTo: format(dateRange[1], 'yyyy-MM-dd'),
      dateFrom: formatRFC3339(dateRange[0]),
      dateTo: formatRFC3339(dateRange[1]),
    };
    const oldDates = {
      dateFrom: formatRFC3339(this.dateRange[0]),
      dateTo: formatRFC3339(this.dateRange[1]),
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
    return this.client.get('warehouse/stockitempricehistory', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Prices Export');
    this.client
      .get('warehouse/stockitempricehistory/excel', {
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

  getSign(cell: any): string {
    if (!cell) {
      return '';
    }
    return cell > 0 ? '+' : '-';
  }

  private get requestBody(): HttpParams {
    const { name, ...state } = this.currentState;

    return new HttpParams({
      fromObject: pickBy(
        {
          dateFrom: formatRFC3339(this.dateRange[0]),
          dateTo: formatRFC3339(this.dateRange[1]),
          ...state,
          barcodeOrName: name as string,
          type: StockItemType.Product.toString(),
        },
        (val) => val || (val as any) === 0
      ),
    });
  }
}
