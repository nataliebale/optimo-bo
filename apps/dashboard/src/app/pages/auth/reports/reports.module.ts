import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PackagePopupModule } from 'apps/dashboard/src/app/popups/package-popup/package-popup.module';
import { RoleGuard } from 'apps/dashboard/src/app/core/services/guards/role.guard';
import { AllLocationsGuard } from '../../../core/services/guards/all-locations.guard';

const routes: Routes = [
  //   {
  //     path: 'general',
  //     canLoad: [RoleGuard],
  //     canActivate: [RoleGuard],
  //     loadChildren: () =>
  //       import('./general/general-report.module').then(
  //         (m) => m.GeneralReportModule
  //       ),
  //   },
  //   {
  //     path: 'horeca',
  //     canLoad: [RoleGuard],
  //     canActivate: [RoleGuard],
  //     loadChildren: () =>
  //       import('./horeca-report/horeca-report.module').then(
  //         (m) => m.HorecaReportModule
  //       ),
  //   },
  // {
  //   path: 'revenues',
  //   canLoad: [RoleGuard],
  //   canActivate: [RoleGuard],
  //   loadChildren: () =>
  //     import('./revenues/revenues-report.module').then(
  //       m => m.RevenuesReportModule
  //     )
  // },
  //   {
  //     path: 'product',
  //     canLoad: [RoleGuard],
  //     canActivate: [RoleGuard],
  //     loadChildren: () =>
  //       import('./product/product-report.module').then(
  //         (m) => m.ProductReportModule
  //       ),
  //   },
  // {
  //   path: 'sale-orders',
  //   canLoad: [RoleGuard],
  //   canActivate: [RoleGuard],
  //   loadChildren: () =>
  //     import(
  //       './sale-orders/sale-orders-report.module'
  //     ).then(m => m.SaleOrdersReportModule)
  // },

  // {
  //   path: 'supplier',
  //   canLoad: [RoleGuard],
  //   canActivate: [RoleGuard],
  //   loadChildren: () =>
  //     import('./supplier/supplier-report.module').then(
  //       m => m.SupplierReportModule
  //     )
  // },
  //   {
  //     path: 'category',
  //     canLoad: [RoleGuard],
  //     canActivate: [RoleGuard],
  //     loadChildren: () =>
  //       import('./categories/categories-report.module').then(
  //         (m) => m.CategoriesReportModule
  //       ),
  //   },
  // {
  //   path: 'orders',
  //   canLoad: [RoleGuard],
  //   canActivate: [RoleGuard],
  //   loadChildren: () =>
  //     import('./orders/orders-report.module').then(
  //       m => m.OrdersReportModule
  //     )
  // },
  {
    path: 'supplies',
    loadChildren: () =>
      import('../histories/supplies/supplies-history.module').then(
        (m) => m.SuppliesHistoryModule
      ),
    data: {
      hotjarEventName: 'Supplies',
    }
  },
  {
    path: 'sale-orders',
    loadChildren: () =>
      import('../histories/sale-orders/sale-orders-history.module').then(
        (m) => m.SaleOrdersHistoryModule
      ),
  },
  {
    path: 'prices',
    loadChildren: () =>
      import('../histories/prices/prices-history.module').then(
        (m) => m.PricesHistoryModule
      ),
    data: {
      hotjarEventName: 'Prices',
    }
  },
  {
    path: 'operators',
    loadChildren: () =>
      import('./operators/operators-report.module').then(
        (m) => m.OperatorsReportModule
      ),
    data: {
      hotjarEventName: 'Shifts',
    }
  },
  {
    path: 'withdrawals',
    loadChildren: () =>
      import('./withdrawals/withdrawals-report.module').then(
        (m) => m.WithdrawalsReportModule
      ),
    data: {
      hotjarEventName: 'Cash Withdrawals',
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), PackagePopupModule],
  providers: [RoleGuard],
})
export class ReportsModule {}
