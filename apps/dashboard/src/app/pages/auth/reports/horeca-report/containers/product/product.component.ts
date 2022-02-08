import { HttpParams, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, Service } from '@optimo/core';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import {
  endOfDay,
  endOfToday,
  formatRFC3339,
  startOfDay,
  startOfYear,
} from 'date-fns';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EReportType,
  IChartValue,
  IReportTab,
  ReportTabManipulation,
  ReportTypeTitles,
} from '../../models';
import { staticData } from '../../models/staticData';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductComponent implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  subscriptions$: Subscription[] = [];
  getUMOAcronym = getUMOAcronym;
  endOfToday = endOfToday();
  dateFrom = this._activatedRoute.snapshot.queryParams['dateFrom'];
  dateTo = this._activatedRoute.snapshot.queryParams['dateTo'];
  private defaultDate = [
    this.dateFrom
      ? startOfDay(new Date(this.dateFrom))
      : startOfYear(Date.now()),
    this.dateTo ? endOfDay(new Date(this.dateTo)) : endOfToday(),
  ];
  dateRange: Date[] = this.defaultDate;
  reportTabs: IReportTab[] = staticData.reportTabs;
  activeTabType: EReportType = EReportType.TotalRevenue;
  ReportTypeTitles = ReportTypeTitles;
  stockItem: any;
  stockItemId: number = +this._activatedRoute.snapshot.queryParams[
    'stockItemId'
  ];
  // excelReportProps = {
  //   daily: 'warehouse/statistics/stockItem/excel/daily',
  //   hourly: 'warehouse/statistics/stockItem/excel/hourly',
  //   dayofweek: 'warehouse/statistics/stockItem/excel/dayofweek',
  // };
  excelReportProps = {
    daily: {
      title: 'warehouse/statistics/stockItem/excel/daily',
      mixPanelTitle: 'Products Statistics Revenue Export',
    },
    profit: {
      title: 'warehouse/statistics/stockItem/excel/daily',
      mixPanelTitle: 'Products Statistics Markup Export',
    },
    transactions: {
      title: 'warehouse/statistics/stockItem/excel/daily',
      mixPanelTitle: 'Products Statistics Transactions Export',
    },
    avgReceipt: {
      title: 'warehouse/statistics/stockItem/excel/daily',
      mixPanelTitle: 'Products Statistics Average Receipt Export',
    },
    hourly: {
      title: 'warehouse/statistics/stockItem/excel/hourly',
      mixPanelTitle: 'Products Statistics Hours Export',
    },
    dayofweek: {
      title: 'warehouse/statistics/stockItem/excel/dayofweek',
      mixPanelTitle: 'Products Statistics Days Export',
    },
  };

  daily: IChartValue[] = staticData.daily;
  hourly: IChartValue[] = staticData.hourly;
  dow: IChartValue[] = staticData.dow;
  dailyLoading: boolean;
  hourlyLoading: boolean;
  dowLoading: boolean;
  isDatePickerVisible = false;
  scrolledToTop = true;
  constructor(
    private _client: ClientService,
    private _cd: ChangeDetectorRef,
    private _fileDownloadHelper: FileDownloadHelper,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Product Statistics');
  }

  ngOnInit(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolledToTop = document.documentElement.scrollTop === 0;
  }

  onDateChanged(date: Date[]): void {
    if (!date) {
      this.dateRange = this.defaultDate;
    } else {
      this.dateRange = date;
    }
    this._router.navigate(['.'], {
      relativeTo: this._activatedRoute,
      queryParams: {
        ...this._activatedRoute.snapshot.queryParams,
        dateFrom: formatRFC3339(this.dateRange[0]),
        dateTo: formatRFC3339(this.dateRange[1]),
      },
    });
    this.refresh();

    this.onToggleDatePicker();
  }

  onToggleDatePicker(): void {
    // this.isDatePickerVisible = !this.isDatePickerVisible;
    // this._cd.markForCheck();
  }

  onStockitemChange(stockItem: any): void {
    if (stockItem) {
      this.stockItem = stockItem;
      this.stockItemId = stockItem.id;
      this._cd.markForCheck();
      this.refresh();
    }
  }

  getSuppliersName(suppliers) {
    if (!suppliers) {
      return '';
    }
    if (suppliers.length === 1) {
      return suppliers[0].name;
    } else {
      return suppliers[0].name + ' ...';
    }
  }

  getTooltip(suppliers) {
    if (!suppliers) {
      return '';
    }
    return suppliers.length ? suppliers.map((s) => s.name).join(', \n') : '';
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
        withTypeFlag: StockItemType.Product.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('barcodeOrName', state.searchValue);
    }

    return this._client.get<any>('stockitems', { params });
  };

  getStockitemById = (id: number): Observable<any> => {
    return this._client.get<any>(`stockitems/${id}`);
  };

  public onExport(prop: string): void {
    this.getMixPanelTitle(prop);
    const sub$ = this._client
      .get<any>(this.excelReportProps[prop].title, {
        service: Service.Reporting,
        params: this.requestBody,
        responseType: 'blob',
      })
      .subscribe((response: HttpResponse<Blob>) => {
        this._fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
    this.subscriptions$.push(sub$);
  }

  private getMixPanelTitle(prop: string): void {
    if (this.activeTabType === EReportType.TotalIncome && prop === 'daily') {
      this._mixpanelService.track(
        this.excelReportProps['profit'].mixPanelTitle
      );
    } else if (
      this.activeTabType === EReportType.TotalOrders &&
      prop === 'daily'
    ) {
      this._mixpanelService.track(
        this.excelReportProps['transactions'].mixPanelTitle
      );
    } else if (
      this.activeTabType === EReportType.AvgOrderRevenue &&
      prop === 'daily'
    ) {
      this._mixpanelService.track(
        this.excelReportProps['avgReceipt'].mixPanelTitle
      );
    } else {
      this._mixpanelService.track(this.excelReportProps[prop].mixPanelTitle);
    }
  }

  private get requestBody(): HttpParams {
    return new HttpParams({
      fromObject: {
        dateFrom: formatRFC3339(new Date(this.dateRange[0])),
        dateTo: formatRFC3339(new Date(this.dateRange[1])),
        stockItemId: `${this.stockItemId}`,
      },
    });
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  refresh() {
    this.getReports(this.activeTabType);
    this.getReportTabs();
  }

  reportTabClick(reportTab: IReportTab) {
    this.activeTabType = reportTab.type;
    this.getReports(this.activeTabType);
    this._cd.markForCheck();
  }

  getReportTabs() {
    this._client
      .get<any>('warehouse/statistics/stockitem', {
        service: Service.Reporting,
        params: this.requestBody,
      })
      .pipe(
        map((response) => {
          const res = new ReportTabManipulation().getReportTabs(response.data);
          return res;
        })
      )
      .toPromise()
      .then((response: IReportTab[]) => {
        this.reportTabs = response;
        this._cd.markForCheck();
      });
  }

  getReports(type: EReportType): void {
    this.getDaily(type);
    this.getHourly(type);
    this.getDow(type);
  }

  getDaily(type: EReportType): void {
    this.dailyLoading = true;
    this._client
      .get<any>('warehouse/statistics/stockitem/daily', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            stockItemId: `${this.stockItemId}`,
            eType: String(type),
          },
        }),
      })
      .toPromise()
      .then((respone: IChartValue[]) => {
        this.daily = respone.map((val) => ({
          ...val,
          value: val.value || '0.0000',
        }));
        this.dailyLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.dailyLoading = false;
      });
  }

  getHourly(type: EReportType): void {
    this.hourlyLoading = true;
    this._client
      .get<any>('warehouse/statistics/stockitem/hourly', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            stockItemId: `${this.stockItemId}`,
            eType: String(type),
          },
        }),
      })
      .toPromise()
      .then((respone: IChartValue[]) => {
        this.hourly = respone.map((val) => ({
          ...val,
          value: val.value || '0.0000',
        }));
        this.hourlyLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.hourlyLoading = false;
      });
  }

  getDow(type: EReportType): void {
    this.dowLoading = true;
    this._client
      .get<any>('warehouse/statistics/stockitem/dow', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            stockItemId: `${this.stockItemId}`,
            eType: String(type),
          },
        }),
      })
      .toPromise()
      .then((respone: IChartValue[]) => {
        this.dow = respone.map((val) => ({
          ...val,
          value: val.value || '0.0000',
        }));
        this.dowLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.dowLoading = false;
      });
  }
}
