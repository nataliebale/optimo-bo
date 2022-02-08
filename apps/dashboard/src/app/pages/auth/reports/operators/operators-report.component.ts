import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
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
import { ColumnType, ColumnData, TableComponent } from '@optimo/ui-table';
import { ClientService, Service, StorageService } from '@optimo/core';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NumberColumnType } from '@optimo/ui-table';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-operators-report',
  templateUrl: './operators-report.component.html',
  styleUrls: ['./operators-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorsReportComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];
  dateRange: Date[] = this.defaultDate;
  public isHorecaMode = this._storageService.isHorecaMode;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'startOperatorName',
      columnType: ColumnType.Text,
      caption: 'OperatorsReport.TableColumns.startOperatorName',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'dateBegin',
      columnType: ColumnType.Date,
      caption: 'OperatorsReport.TableColumns.dateBegin',
      data: {
        type: 'dateTime',
        maxDate: new Date(),
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'dateEnd',
      columnType: ColumnType.Date,
      caption: 'OperatorsReport.TableColumns.dateEnd',
      data: {
        type: 'dateTime',
        maxDate: new Date(),
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'cashBegin',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashBegin',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'turnoverCash',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCash',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'cashWithdrawn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashWithdrawn',
      data: { type: NumberColumnType.Currency },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnoverCashReturn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCashReturn',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'cashEnd',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashRegisterCashEnd',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'expectedCashEnd',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.expectedCashEnd',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'difference',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.difference',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnoverCard',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCard',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnOverConsignation',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnOverConsignation',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnOverCardReturn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnOverCardReturn',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'tradeSum',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.tradeSum',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
  ];
  horecaDisplayedColumns: ColumnData[] = 
  [
    {
      dataField: 'startOperatorName',
      columnType: ColumnType.Text,
      caption: 'OperatorsReport.TableColumns.startOperatorName',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'dateBegin',
      columnType: ColumnType.Date,
      caption: 'OperatorsReport.TableColumns.dateBegin',
      data: {
        type: 'dateTime',
        maxDate: new Date(),
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'endOperatorName',
      columnType: ColumnType.Text,
      caption: 'OperatorsReport.TableColumns.startOperatorName',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'dateEnd',
      columnType: ColumnType.Date,
      caption: 'OperatorsReport.TableColumns.dateEnd',
      data: {
        type: 'dateTime',
        maxDate: new Date(),
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'cashBegin',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashBegin',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'turnoverCash',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCash',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
        {
      dataField: 'grandTotalOrderLinesPrice',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.grandTotalOrderLinesPrice',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 2 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'grandTotalTaxAmount',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.grandTotalTaxAmount',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 2 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'cashWithdrawn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashWithdrawn',
      data: { type: NumberColumnType.Currency },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnoverCashReturn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCashReturn',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'cashEnd',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.cashRegisterCashEnd',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'expectedCashEnd',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.expectedCashEnd',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'difference',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.difference',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnoverCard',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnoverCard',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnOverConsignation',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnOverConsignation',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'turnOverCardReturn',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.turnOverCardReturn',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'tradeSum',
      columnType: ColumnType.Number,
      caption: 'OperatorsReport.TableColumns.tradeSum',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
  ];
  // [
  //   {
  //     dataField: 'startOperatorName',
  //     columnType: ColumnType.Text,
  //     caption: 'OperatorsReport.TableColumns.startOperatorName',
  //     filterable: true,
  //     sortable: true,
  //     canNotChangeVisibility: true,
  //   },
  //   {
  //     dataField: 'dateBegin',
  //     columnType: ColumnType.Date,
  //     caption: 'OperatorsReport.TableColumns.dateBegin',
  //     data: {
  //       type: 'dateTime',
  //       maxDate: new Date(),
  //     },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'cashBegin',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.cashBegin',
  //     data: {
  //       type: NumberColumnType.Currency,
  //     },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'turnover',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.turnover',
  //     data: {
  //       type: NumberColumnType.Currency,
  //     },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'grandTotalOrderLinesPrice',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.grandTotalOrderLinesPrice',
  //     data: { type: NumberColumnType.Currency, digitsAfterDot: 2 },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'grandTotalTaxAmount',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.grandTotalTaxAmount',
  //     data: { type: NumberColumnType.Currency, digitsAfterDot: 2 },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'cashWithdrawn',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.cashWithdrawn',
  //     data: { type: NumberColumnType.Currency, digitsAfterDot: 2 },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'endOperatorName',
  //     columnType: ColumnType.Text,
  //     caption: 'OperatorsReport.TableColumns.endOperatorName',
  //     filterable: true,
  //     sortable: true,
  //     canNotChangeVisibility: true,
  //   },
  //   {
  //     dataField: 'dateEnd',
  //     columnType: ColumnType.Date,
  //     caption: 'OperatorsReport.TableColumns.dateEnd',
  //     data: {
  //       type: 'dateTime',
  //       maxDate: new Date(),
  //     },
  //     filterable: true,
  //     sortable: true,
  //   },
  //   {
  //     dataField: 'cashEnd',
  //     columnType: ColumnType.Number,
  //     caption: 'OperatorsReport.TableColumns.cashEnd',
  //     data: {
  //       type: NumberColumnType.Currency,
  //     },
  //     filterable: true,
  //     sortable: true,
  //   },
  // ];

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    private _storageService: StorageService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this.getDateRangeFromUrl();
    this._mixpanelService.track('Shifts');
  }

  getDateRangeFromUrl(): void {
    if (!this.route.snapshot.queryParams['dateFrom']) {
      const params = {
        dateFrom: format(this.dateRange[0], 'yyyy-MM-dd'),
        dateTo: format(this.dateRange[1], 'yyyy-MM-dd'),
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
    return this.client.get('sales/salesoperatorsshifts', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Shifts Export');
    this.client
      .get('sales/salesoperatorsshifts/excel', {
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
    return new HttpParams({
      fromObject: {
        saleOrderDateFrom: formatRFC3339(this.dateRange[0]),
        saleOrderDateTo: formatRFC3339(this.dateRange[1]),
        ...this.currentState,
      },
    });
  }

  cashSumIsValid(row): boolean {
    return (
      (row.cashEnd * 1.0).toFixed(4) !==
      ((row.cashBegin + row.turnover - row.cashWithdrawn) * 1.0).toFixed(4)
    );
  }
}
