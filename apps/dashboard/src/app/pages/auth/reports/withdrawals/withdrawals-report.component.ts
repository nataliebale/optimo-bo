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
  startOfDay,
  endOfDay,
  format,
} from 'date-fns';
import { ColumnType, ColumnData, TableComponent } from '@optimo/ui-table';
import { ClientService, Service } from '@optimo/core';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NumberColumnType } from '@optimo/ui-table';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-withdrawals-report',
  templateUrl: './withdrawals-report.component.html',
  styleUrls: ['./withdrawals-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawalsReportComponent extends BaseListComponent {
  @ViewChild('tableInstance') tableInstance: TableComponent;
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];
  dateRange: Date[] = this.defaultDate;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'operatorName',
      columnType: ColumnType.Text,
      caption: 'WithdrawalsReport.TableColumns.operatorName',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'reason',
      columnType: ColumnType.Text,
      caption: 'WithdrawalsReport.TableColumns.reason',
      filterable: true,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'amount',
      columnType: ColumnType.Number,
      caption: 'WithdrawalsReport.TableColumns.amount',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'withdrawalDate',
      columnType: ColumnType.Date,
      caption: 'WithdrawalsReport.TableColumns.withdrawalDate',
      data: {
        type: 'dateTime',
        maxDate: new Date(),
      },
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
    this._mixpanelService.track('Withdrawals');
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
    return this.client.get('sales/withdrawals', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  onExport(): void {
    this._mixpanelService.track('Cash Withdrawals Export');
    this.client
      .get('sales/withdrawals/excel', {
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
        withdrawalDateFrom: formatRFC3339(this.dateRange[0]),
        withdrawalDateTo: formatRFC3339(this.dateRange[1]),
        ...this.currentState,
      },
    });
  }
}
