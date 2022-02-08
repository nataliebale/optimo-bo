import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from '@optimo/core';
import { fromEvent, Observable } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { PackageType } from '../request/form/package-type.enum';
import { TableData } from './table/packages-table.component';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
})
export class PackagesComponent {
  @ViewChild('backgroundElement', { static: true })
  backgroundElement: ElementRef;

  isAnnualActive: boolean;
  yearActive = false;
  activeTab: PackageType;
  packageType = PackageType;

  technicTableData: TableData = {
    title: 'PackagesPage.Technic',
    rows: [
      {
        title: 'PackagesPage.CashDevice',
        basic: '1',
        standard: 'PackagesPage.Unlimited',
        premium: true,
      },
    ],
  };

  controlTableData: TableData = {
    title: 'PackagesPage.InventoryManagement',
    rows: [
      {
        title: 'PackagesPage.ProductManagement',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.ManageCategories',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.SupplierManagement',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.OrderManagement',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.PriceManagement',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.Inventorization',
        basic: true,
        standard: true,
        premium: true,
      },
    ],
  };

  integrationsTableData: TableData = {
    title: 'PackagesPage.Integrations',
    rows: [
      {
        title: 'PackagesPage.IntegrationWithRS',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.IntegrationWithElectricScales',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.IntegrationWithKasa.ge',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.IntegrationWithDaisyExpert',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.IntegrationWithExtra.ge',
        basic: false,
        standard: true,
        premium: true,
      },
    ],
  };

  accountingTableData: TableData = {
    title: 'PackagesPage.InformationRequiredForAnAccountant',
    rows: [
      {
        title: 'PackagesPage.SalesManagement',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.BalanceManagement',
        basic: true,
        standard: true,
        premium: true,
      },
    ],
  };

  prodTableData: TableData = {
    title: 'PackagesPage.Production',
    rows: [
      {
        title: 'PackagesPage.Recipes',
        basic: true,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.Making',
        basic: true,
        standard: true,
        premium: true,
      },
    ],
  };

  statisticsTableData: TableData = {
    title: 'PackagesPage.Statistics',
    rows: [
      {
        title: 'PackagesPage.GeneralStatistics',
        basic: false,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.ProductStatistics',
        basic: false,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.StatisticsOfSuppliers',
        basic: false,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.CategoryStatistics',
        basic: false,
        standard: true,
        premium: true,
      },
      {
        title: 'PackagesPage.StatisticsOfShifts',
        basic: false,
        standard: true,
        premium: true,
      },
    ],
  };

  scrollThreshold$: Observable<boolean> = fromEvent(this.document, 'scroll', {
    passive: true,
  }).pipe(
    map(() => {
      const fullHeight = this.backgroundElement.nativeElement.clientHeight;
      const scrollTop = this.document.documentElement.scrollTop;
      return scrollTop > fullHeight;
    }),
    distinctUntilChanged(),
    startWith(false)
  );

  constructor(
    @Inject(DOCUMENT) private document: any,
    private googleAnalytics: GoogleAnalyticsService,
    public translateService: TranslateService
  ) {}

  toggleAnnualActive(): void {
    this.isAnnualActive = !this.isAnnualActive;
  }

  onChangeTab(tab: PackageType): void {
    this.activeTab = tab;
  }

  onScrollUp(): void {
    this.document.body.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  isActiveTab(type: PackageType): boolean {
    return this.activeTab === type || this.activeTab === undefined;
  }

  onRequest(): void {
    this.googleAnalytics.sendEvent('request_order', 'button_click');
  }
}
