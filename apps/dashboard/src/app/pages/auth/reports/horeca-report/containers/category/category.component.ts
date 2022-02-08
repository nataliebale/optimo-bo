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
import {
  endOfDay,
  endOfToday,
  formatRFC3339,
  startOfDay,
  startOfYear,
} from 'date-fns';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryStatuses } from '../../../../../../core/enums/category-status.enum';
import { getUMOAcronym } from '../../../../../../core/enums/measurement-units.enum';
import { FileDownloadHelper } from '../../../../../../core/helpers/file-download/file-download.helper.ts';
import {
  EReportType,
  IChartValue,
  IReportTab,
  ITopTenItems,
  ReportTypeTitles,
} from '../../models';
import { ReportTabManipulation } from '../../models/report-tab-manipulation';
import { staticData } from '../../models/staticData';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-product',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent implements OnInit, OnDestroy {
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
  reportTabs: IReportTab[] = [
    {
      type: 1,
      sum: 0,
      disable: false,
      show: true,
      title: ReportTypeTitles.get(1),
      value: 0,
      active: true,
    },
    {
      type: 2,
      sum: 0,
      disable: false,
      show: true,
      title: ReportTypeTitles.get(2),
      value: 0,
      active: false,
    },
  ];
  activeTabType: EReportType = EReportType.TotalRevenue;
  ReportTypeTitles = ReportTypeTitles;
  stockItemCategory: any;
  categoryId: number = +this._activatedRoute.snapshot.queryParams['categoryId'];
  topTenStockItems: ITopTenItems[] = [];
  sortDirection: 'desc' | 'asc' = 'desc';
  sortColumn = 'totalRevenue';
  popularTableProps = [
    { key: 'stockItemName', value: 'GENERAL.NAME' },
    { key: 'totalOrders', value: 'GENERAL.TRANSACTIONS' },
    { key: 'totalIncome', value: 'GENERAL.MARGIN' },
    { key: 'totalRevenue', value: 'GENERAL.INCOME' },
  ];

  daily: IChartValue[] = staticData.daily;
  hourly: IChartValue[] = staticData.hourly;
  dow: IChartValue[] = staticData.dow;

  excelReportProps = {
    daily: {
      title: 'warehouse/statistics/categories/excel/daily',
      mixPanelTitle: 'Categories Statistics Revenue Export',
    },
    profit: {
      title: 'warehouse/statistics/categories/excel/daily',
      mixPanelTitle: 'Categories Statistics Markup Export',
    },
    hourly: {
      title: 'warehouse/statistics/categories/excel/hourly',
      mixPanelTitle: 'Categories Statistics Hours Export',
    },
    dayofweek: {
      title: 'warehouse/statistics/categories/excel/dayofweek',
      mixPanelTitle: 'Categories Statistics Days Export',
    },
    // hourly: 'warehouse/statistics/categories/excel/hourly',
    // dayofweek: 'warehouse/statistics/categories/excel/dayofweek',
  };
  topTenStockItemsLoading: boolean;
  dailyLoading: boolean;
  hourlyLoading: boolean;
  dowLoading: boolean;
  scrolledToTop = true;
  constructor(
    private _client: ClientService,
    private _cd: ChangeDetectorRef,
    private _fileDownloadHelper: FileDownloadHelper,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Category Statistics');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolledToTop = document.documentElement.scrollTop === 0;
  }

  sort(sortColumn: string) {
    if (this.sortColumn === sortColumn) {
      switch (this.sortDirection) {
        case 'asc':
          this.sortDirection = 'desc';
          break;
        case 'desc':
          this.sortDirection = 'asc';
          this.sortColumn = 'id';
          break;
      }
    } else {
      this.sortColumn = sortColumn;
      this.sortDirection = 'asc';
    }
    this.topTenStockItems = this.sortTableData(this.topTenStockItems);
    this._cd.markForCheck();
  }

  sortTableData(topTenItems: ITopTenItems[]): ITopTenItems[] {
    return _.orderBy(topTenItems, [this.sortColumn], [this.sortDirection]);
  }

  navigateToProductStatistickPage(stockItemId: number) {
    this._router.navigate(['/statistics/products'], {
      queryParams: {
        stockItemId: stockItemId,
        dateFrom: formatRFC3339(this.dateRange[0]),
        dateTo: formatRFC3339(this.dateRange[1]),
      },
    });
  }

  ngOnInit(): void {}

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
  }

  stockItemCategoryChange(_category: any): void {
    if (_category) {
      this.stockItemCategory = _category;
      this.categoryId = _category.id;
      this._cd.markForCheck();
      this.refresh();
    }
  }

  getSuppliersName(suppliers) {
    if (suppliers.length === 1) {
      return suppliers[0];
    } else {
      return suppliers[0] + ' ...';
    }
  }

  getTooltip(suppliers) {
    return suppliers.length ? suppliers.map((s) => s).join(', \n') : '';
  }

  getStockitemCategories = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [
          CategoryStatuses.Enabled.toString(),
          CategoryStatuses.Disabled.toString(),
        ],
      },
    });

    if (state.searchValue && state.searchValue !== '') {
      params = params.append('name', state.searchValue);
    }

    return this._client.get<any>('stockitemcategories', { params });
  };

  getStockitemCategoryById = (id: number): Observable<any> => {
    return this._client.get<any>(`stockitemcategories/${id}`);
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
      console.log(this.excelReportProps['profit'].mixPanelTitle);
      this._mixpanelService.track(
        this.excelReportProps['profit'].mixPanelTitle
      );
    } else {
      console.log(this.excelReportProps[prop].mixPanelTitle);
      this._mixpanelService.track(this.excelReportProps[prop].mixPanelTitle);
    }
  }

  private get requestBody(): HttpParams {
    return new HttpParams({
      fromObject: {
        dateFrom: formatRFC3339(new Date(this.dateRange[0])),
        dateTo: formatRFC3339(new Date(this.dateRange[1])),
        categoryId: `${this.categoryId}`,
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
    this.getTops();
  }

  reportTabClick(reportTab: IReportTab) {
    this.activeTabType = reportTab.type;
    this.getReports(this.activeTabType);
    this._cd.markForCheck();
  }

  getReportTabs() {
    this._client
      .get<any>('warehouse/statistics/categories', {
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
      .then((respone: IReportTab[]) => {
        this.reportTabs = respone;
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
      .get<any>('warehouse/statistics/categories/daily', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            categoryId: `${this.categoryId}`,
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
      .get<any>('warehouse/statistics/categories/hourly', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            categoryId: `${this.categoryId}`,
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
      .get<any>('warehouse/statistics/categories/dow', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            categoryId: `${this.categoryId}`,
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

  getTopTenStockItems(): void {
    this.topTenStockItemsLoading = true;
    this._client
      .get<any>('warehouse/statistics/categories/popular/stockitems', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
            categoryId: `${this.categoryId}`,
          },
        }),
      })
      .pipe(map((res: ITopTenItems[]) => this.sortTableData(res)))
      .toPromise()
      .then((table: ITopTenItems[]) => {
        this.topTenStockItems = table;
        this.topTenStockItemsLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.topTenStockItemsLoading = false;
      });
  }

  getTops(): void {
    this.getTopTenStockItems();
  }
}
