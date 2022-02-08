import { LotsHistorySpecificComponent } from './specific/lots-history-specific.component';
import { LotsHistoryGeneralComponent } from './general/lots-history-general.component';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ClientService, Service } from '@optimo/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { Observable, Subject } from 'rxjs';
import {
  endOfToday,
  startOfYear,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { BaseListComponent } from './../../base-list.component';
import { ColumnData } from '@optimo/ui-table';
import { MatDialog } from '@angular/material/dialog';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-lots-history',
  templateUrl: './lots-history.component.html',
  styleUrls: ['./lots-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotsHistoryComponent extends BaseListComponent {
  displayedColumns: ColumnData[];
  protected get httpGetItems(): Observable<any> {
    throw new Error('Method not implemented.');
  }
  private _stockItemId: number;
  response: HttpResponse<Blob>;

  set stockItemId(value: number) {
    this._stockItemId = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { stockItemId: value },
        queryParamsHandling: 'merge',
      });
    }
  }

  get stockItemId(): number {
    return this._stockItemId;
  }

  firstLoad = true;

  stockItem: any;

  private defaultDate = [startOfYear(Date.now()), endOfToday()];

  private _dateRange: Date[] = this.defaultDate;

  private child: LotsHistoryGeneralComponent | LotsHistorySpecificComponent;

  set dateRange(value: Date[]) {
    if (!value) {
      value = this.defaultDate;
    }

    this._dateRange = value;
    const params = {
      dateFrom: format(value[0], 'yyyy-MM-dd'),
      dateTo: format(value[1], 'yyyy-MM-dd'),
    };
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    route: ActivatedRoute,
    router: Router,
    cdr: ChangeDetectorRef,
    notificator: NotificationsService,
    dialog: MatDialog,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Lots');
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ stockItemId, dateFrom, dateTo }) => {
        if (stockItemId) {
          this.stockItemId = +stockItemId;
        }
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

  getStockitems = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [
          StockItemStatuses.Enabled.toString(),
          StockItemStatuses.Disabled.toString(),
        ],
        withoutTypeFlag: StockItemType.Manufactured.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this.client.get('stockitems', { params });
  };

  getStockitemById = (id: number): Observable<any> => {
    return this.client.get(`stockitems/${id}`);
  };

  onStockitemChange(stockItem: any): void {
    this.stockItem = stockItem;
    this.cdr.markForCheck();
  }

  onDateChanged(dateRange: Date[]): void {
    this.dateRange = dateRange;
  }

  onChildChanged(
    child: LotsHistoryGeneralComponent | LotsHistorySpecificComponent
  ) {
    this.child = child;
    console.log('this.child', this.child);
  }

  onExport(): void {
    this._mixpanelService.track('Lots Export');
    console.log('onExport -> this.child', this.child);
    if (this.child) {
      this.child.onExport();
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
