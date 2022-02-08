import { HttpParams, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, Service } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';
import { endOfToday, formatRFC3339, startOfYear } from 'date-fns';
import * as _ from 'lodash';
import { mapValues } from 'lodash';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { getUMOAcronym } from '../../../../../../core/enums/measurement-units.enum';
import { FileDownloadHelper } from '../../../../../../core/helpers/file-download/file-download.helper.ts';
import {
  EReportType,
  IChartValue,
  IReportTab,
  ITopTenItems,
  ReportTabManipulation,
  ReportTypeTitles,
} from '../../models';
import { staticData } from '../../models/staticData';
@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralComponent implements OnInit, OnDestroy {
  subscriptions$: Subscription[] = [];
  getUMOAcronym = getUMOAcronym;
  endOfToday = endOfToday();
  private defaultDate = [startOfYear(Date.now()), endOfToday()];
  dateRange: Date[] = this.defaultDate;
  reportTabs: IReportTab[] = staticData.reportTabs;
  activeTabType: EReportType = EReportType.TotalRevenue;
  ReportTypeTitles = ReportTypeTitles;
  popularTableProps = [
    { key: 'stockItemName', value: 'დასახელება' },
    { key: 'totalOrders', value: 'ტრანზაქციები' },
    { key: 'totalIncomePercentage', value: 'ფასნამატი (%)' },
    { key: 'totalIncome', value: 'ფასნამატი' },
    { key: 'totalRevenue', value: 'შემოსავალი' },
  ];
  topTenStockItems: ITopTenItems[] = [];
  sortDirection: 'desc' | 'asc' = 'desc';
  sortColumn = 'totalRevenue';
  // excelReportProps = {
  //   daily: 'warehouse/statistics/general/excel/daily',
  //   hourly: 'warehouse/statistics/general/excel/hourly',
  //   dayofweek: 'warehouse/statistics/general/excel/dayofweek',
  // };

  excelReportProps = {
    daily: {
      title: 'warehouse/statistics/general/excel/daily',
      mixPanelTitle: 'General Statistics Revenue Export',
    },
    profit: {
      title: 'warehouse/statistics/general/excel/daily',
      mixPanelTitle: 'General Statistics Markup Export',
    },
    transactions: {
      title: 'warehouse/statistics/general/excel/daily',
      mixPanelTitle: 'General Statistics Transactions Export',
    },
    avgReceipt: {
      title: 'warehouse/statistics/general/excel/daily',
      mixPanelTitle: 'General Statistics Average Receipt Export',
    },
    hourly: {
      title: 'warehouse/statistics/general/excel/hourly',
      mixPanelTitle: 'General Statistics Hours Export',
    },
    dayofweek: {
      title: 'warehouse/statistics/general/excel/dayofweek',
      mixPanelTitle: 'General Statistics Days Export',
    },
  };
  selectedTabLabel = 'STATISTICS.GENERAL.POPULAR_PRODUCTS';

  topTenCategories: ITopTenItems[] = [];
  sortCategoriesDirection: 'desc' | 'asc' = 'desc';
  sortCategoriesColumn = 'totalRevenue';
  popularCategoriesTableProps = [
    { key: 'name', value: 'GENERAL.NAME' },
    { key: 'totalIncomePercentage', value: 'GENERAL.PROFIT_PERCENT' },
    { key: 'totalIncome', value: 'GENERAL.MARGIN' },
    { key: 'totalRevenue', value: 'GENERAL.INCOME' },
  ];
  daily: IChartValue[] = staticData.daily;
  hourly: IChartValue[] = staticData.hourly;
  dow: IChartValue[] = staticData.dow;
  topTenStockItemsLoading: boolean;
  topTenCategoriesLoading: boolean;
  dailyLoading: boolean;
  hourlyLoading: boolean;
  dowLoading: boolean;
  scrolledToTop = true;
  dynamicLabel = null;

  constructor(
    private _client: ClientService,
    private _cd: ChangeDetectorRef,
    private _fileDownloadHelper: FileDownloadHelper,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('General Statistics');
  }
  // 	statisticsIncome
  // statisticsTimes
  // statisticsTopTens

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.getStatisticViewName();
    this.scrolledToTop = document.documentElement.scrollTop === 0;
  }

  getStatisticViewName() {
    const labelNameTop: number = document
      .getElementById('labelName')
      .getBoundingClientRect().top;
    const timesLabelTop: number = document
      .getElementById('timesLabel')
      .getBoundingClientRect().top;
    const timesLabelTxt: string = document
      .getElementById('timesLabel')
      .innerHTML.trim();
    const topTensLabelTop: number = document
      .getElementById('topTensLabel')
      .getBoundingClientRect().top;
    const topTensLabelTxt: string = document
      .getElementById('topTensLabel')
      .innerHTML.trim();
    if (labelNameTop + 40 > timesLabelTop) {
      this.dynamicLabel = timesLabelTxt;
    } else if (labelNameTop + 40 > topTensLabelTop) {
      this.dynamicLabel = topTensLabelTxt;
    } else {
      this.dynamicLabel = null;
    }
  }

  sortCategories(sortColumn: string) {
    if (this.sortCategoriesColumn === sortColumn) {
      switch (this.sortCategoriesDirection) {
        case 'asc':
          this.sortCategoriesDirection = 'desc';
          break;
        case 'desc':
          this.sortCategoriesDirection = 'asc';
          this.sortCategoriesColumn = 'id';
          break;
      }
    } else {
      this.sortCategoriesColumn = sortColumn;
      this.sortCategoriesDirection = 'asc';
    }
    this.topTenCategories = this.sortCategoriesTableData(this.topTenCategories);
    this._cd.markForCheck();
  }

  sortCategoriesTableData(topTenItems: ITopTenItems[]): ITopTenItems[] {
    return _.orderBy(
      topTenItems,
      [this.sortCategoriesColumn],
      [this.sortCategoriesDirection]
    );
  }

  sort(sortColumn: string) {
    if (this.sortColumn === sortColumn) {
      switch (this.sortDirection) {
        case 'asc':
          this.sortDirection = 'desc';
          break;
        case 'desc':
          this.sortDirection = 'asc';
          this.sortColumn = 'stockItemId';
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

  ngOnInit(): void {
    this.refresh();
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
      .get<any>('warehouse/statistics/general', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
          },
        }),
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
      .get<any>('warehouse/statistics/general/daily', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
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
      .get<any>('warehouse/statistics/general/hourly', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
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
      .get<any>('warehouse/statistics/general/dow', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
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
      .get<any>('warehouse/statistics/general/popular/stockitems', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
          },
        }),
      })
      .pipe(map((res: ITopTenItems[]) => this.sortTableData(res)))
      .toPromise()
      .then((table: ITopTenItems[]) => {
        console.log('bugs => table(topTenItems):', table);
        this.topTenStockItems = table;
        this.topTenStockItemsLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.topTenStockItemsLoading = false;
      });
  }

  getTopTenCategories(): void {
    this.topTenCategoriesLoading = true;
    this._client
      .get<any>('warehouse/statistics/general/popular/categories', {
        service: Service.Reporting,
        params: new HttpParams({
          fromObject: {
            dateFrom: formatRFC3339(this.dateRange[0]),
            dateTo: formatRFC3339(this.dateRange[1]),
          },
        }),
      })
      .pipe(map((res: ITopTenItems[]) => this.sortCategoriesTableData(res)))
      .toPromise()
      .then((table: ITopTenItems[]) => {
        this.topTenCategories = table;
        this.topTenCategoriesLoading = false;
        this._cd.markForCheck();
      })
      .catch(() => {
        this.topTenCategoriesLoading = false;
      });
  }

  getTops(): void {
    this.getTopTenStockItems();
    this.getTopTenCategories();
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

    // this.onToggleDatePicker();
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

  navigateToCategoriesStatistickPage(categoryId: number) {
    this._router.navigate(['/statistics/categories'], {
      queryParams: {
        categoryId: categoryId,
        dateFrom: formatRFC3339(this.dateRange[0]),
        dateTo: formatRFC3339(this.dateRange[1]),
      },
    });
  }

  // onTabChange(event) {
  //   this.selectedTabLabel = event.tab.textLabel;
  // }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel =
      event.index === 0
        ? 'STATISTICS.GENERAL.POPULAR_PRODUCTS'
        : 'STATISTICS.GENERAL.POPULAR_CATEGORIES';
  }

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
    } else if (
      this.activeTabType === EReportType.TotalOrders &&
      prop === 'daily'
    ) {
      console.log(this.excelReportProps['transactions'].mixPanelTitle);
      this._mixpanelService.track(
        this.excelReportProps['transactions'].mixPanelTitle
      );
    } else if (
      this.activeTabType === EReportType.AvgOrderRevenue &&
      prop === 'daily'
    ) {
      console.log(this.excelReportProps['avgReceipt'].mixPanelTitle);
      this._mixpanelService.track(
        this.excelReportProps['avgReceipt'].mixPanelTitle
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
      },
    });
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
