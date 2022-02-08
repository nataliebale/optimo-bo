import { AllLocationsGuard } from './../../core/services/guards/all-locations.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/services/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
  },
  {
    path: 'inventory',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./inventory/inventory.module').then((m) => m.InventoryModule),
    data: {
      hotjarEventName: 'Products',
    },
  },
  {
    path: 'suppliers',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./suppliers/suppliers.module').then((m) => m.SuppliersModule),
    data: {
      hotjarEventName: 'Suppliers',
    },
  },
  {
    path: 'suppliers-history',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./suppliers-history/suppliers-history.module').then(
        (m) => m.SuppliersHistoryModule
      ),
    data: {
      hotjarEventName: 'Liability Management',
    },
  },
  {
    path: 'operators',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./operators/operators.module').then((m) => m.OperatorsModule),
    data: {
      hotjarEventName: 'Employees',
    },
  },

  {
    path: 'orders',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./orders/orders.module').then((m) => m.OrdersModule),
    data: {
      hotjarEventName: 'Purchases',
    },
  },
  {
    path: 'entity-sales',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./entity-sales/entity-sales.module').then(
        (m) => m.EntitySalesModule
      ),
    data: {
      hotjarEventName: 'B2B Sales',
    },
  },
  {
    path: 'entity-clients',
    loadChildren: () =>
      import('./entity-clients/entity-clients.module').then(
        (m) => m.EntityClientsModule
      ),
    data: {
      hotjarEventName: 'B2B Clients',
    },
  },
  {
    path: 'categories',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./categories/categories.module').then((m) => m.CategoriesModule),
    data: {
      hotjarEventName: 'Categories',
    },
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.module').then((m) => m.ReportsModule),
    data: {
      hotjarEventName: 'Reports',
    },
  },
  {
    path: 'glovo-subcategories',
    loadChildren: () =>
      import('./glovo-subcategories/glovo-subcategories.module').then(
        (m) => m.GlovoSubcategoriesModule
      ),
    data: {
      hotjarEventName: 'Glovo Subcategories',
    },
  },
  {
    path: 'glovo-products',
    loadChildren: () =>
      import('./glovo-products/glovo-products.module').then(
        (m) => m.GlovoProductsModule
      ),
    data: {
      hotjarEventName: 'Glovo Products',
    },
  },
  {
    path: 'statistics',
    canActivate: [RoleGuard],
    loadChildren: () =>
      import('./reports/horeca-report/horeca-report.module').then(
        (m) => m.HorecaReportModule
      ),
  },
  {
    path: 'history',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./histories/histories.module').then((m) => m.HistoriesModule),
  },
  {
    path: 'transactions',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./transaction-history/transaction-history.module').then(
        (m) => m.TransactionHistoryModule
      ),
    data: {
      hotjarEventName: 'Transactions',
    },
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'profile',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
    data: {
      hotjarEventName: 'Profile',
    },
  },
  {
    path: 'rs',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./revenue-service/revenue-service.module').then(
        (m) => m.RevenueServiceModule
      ),
    data: {
      hotjarEventName: 'Waybills',
    },
  },
  {
    path: 'locations',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./locations/locations.module').then((m) => m.LocationsModule),
    data: {
      hotjarEventName: 'Locations',
    },
  },
  {
    path: 'sub-users',
    loadChildren: () =>
      import('./sub-users/sub-users.module').then((m) => m.SubUsersModule),
    data: {
      hotjarEventName: 'Sub Users',
    },
  },
  {
    path: 'stockholdings',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./stockholdings/stockholdings.module').then(
        (m) => m.StockholdingsModule
      ),
    data: {
      hotjarEventName: 'Stockholdings',
    },
  },
  {
    path: 'tutorials',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./tutorials/tutorials.module').then((m) => m.TutorialsModule),
    data: {
      hotjarEventName: 'Help',
    },
  },
  {
    path: 'popular-products',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./popular-products/popular-products.module').then(
        (m) => m.PopularProductsModule
      ),
  },
  {
    path: 'shippings',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./shippings/shippings.module').then((m) => m.ShippingsModule),
    data: {
      hotjarEventName: 'Stock Transfers',
    },
  },
  {
    path: 'inventorisations',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./inventorisations/inventorisations.module').then(
        (m) => m.InventorisationsModule
      ),
    data: {
      hotjarEventName: 'Stock Takes',
    },
  },
  {
    path: 'prices-change',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./prices-change/prices-change.module').then(
        (m) => m.PricesChangeModule
      ),
  },
  {
    path: 'ingredients',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./ingredients/ingredients.module').then(
        (m) => m.IngredientsModule
      ),
    data: {
      hotjarEventName: 'Ingredients',
    },
  },
  {
    path: 'receipts',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./receipts/receipts.module').then((m) => m.ReceiptsModule),
    data: {
      hotjarEventName: 'Recipes',
    },
  },
  {
    path: 'receipt-templates',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./receipt-templates/receipt-templates.module').then(
        (m) => m.ReceiptTemplatesModule
      ),
    data: {
      hotjarEventName: 'Recipe Templates',
    },
  },
  {
    path: 'production-orders',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./production-orders/production-orders.module').then(
        (m) => m.ProductionOrdersModule
      ),
    data: {
      hotjarEventName: 'Preparations',
    },
  },
  {
    path: 'tables',
    canActivate: [AllLocationsGuard],
    loadChildren: () =>
      import('./tables/tables.module').then((m) => m.TablesModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AuthModule {}
