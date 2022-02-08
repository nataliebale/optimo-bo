import { EOptimoProductType } from '@optimo/core';
import { INestedMenuItem } from '@optimo/ui-nested-menu';

export interface IOptimoDashboardMenuItem extends INestedMenuItem {
  productTypes: EOptimoProductType[];
  isVisibleForAllLocations: boolean;
  pageName?: string;
  allowedRoles?: string[];
  translateId?: string;
}

export const MENU_TREE: IOptimoDashboardMenuItem[] = [
  {
    path: '/dashboard',
    text: 'GENERAL.MAIN',
    icon: 'dashboard',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: true,
  },
  {
    text: 'GENERAL.PRODUCTS',
    icon: 'product',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    children: [
      {
        path: '/inventory',
        text: 'GENERAL.PRODUCTS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/categories',
        text: 'GENERAL.CATEGORIES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/shippings',
        text: 'GENERAL.TRANSPORTATIONS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/inventorisations',
        text: 'GENERAL.INVENTORISATION',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
    ],
  },
  {
    text: 'მომწოდებლები',
    icon: 'suppliers',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    translateId: 'GENERAL.SUPPLIERS',
    children: [
      {
        path: '/suppliers',
        text: 'მომწოდებლები',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
        translateId: 'GENERAL.SUPPLIERS',
      },
      {
        path: '/suppliers-history',
        text: 'ისტორია',
        pageName: 'მომწოდებლების ისტორია',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
        translateId: 'GENERAL.SUPPLIERS_HISTORY',
      },
    ],
  },
  // {
  //   text: 'მომწოდებლები',
  //   icon: 'suppliers',
  //   productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
  //   isVisibleForAllLocations: false,
  //   decisionField: 'isEntitySaleEnabled',
  //   translateId: 'GENERAL.SUPPLIERS',
  //   children: [
  //     {
  //       path: '/suppliers',
  //       text: 'მომწოდებლები',
  //       productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
  //       isVisibleForAllLocations: false,
  //       translateId: 'GENERAL.SUPPLIERS',
  //     },
  //     {
  //       path: '/dashboard',
  //       text: 'ისტორია',
  //       productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
  //       isVisibleForAllLocations: false,
  //       translateId: 'GENERAL.SUPPLIERS',
  //     },
  //   ],
  // },
  {
    text: 'GENERAL.PURCHASES',
    icon: 'orders',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    children: [
      {
        path: '/orders',
        text: 'GENERAL.PURCHASES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/rs/waybills',
        text: 'GENERAL.WAYBILLS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/history/lots',
        text: 'GENERAL.LOTS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
    ],
  },
  {
    text: 'GENERAL.ENITYT_SALES',
    icon: 'entity-sales',
    // alt: 'იურიდიულ პირზე გაყიდვები',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    decisionField: 'isEntitySaleEnabled',
    children: [
      {
        path: '/entity-sales',
        text: 'GENERAL.SALES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/entity-clients',
        text: 'GENERAL.BUYERS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
    ],
    // children: [
    //   {
    //     path: '/entity-sales',
    //     text: 'გაყიდვები'
    //   },
    //   {
    //     path: '/entity-clients',
    //     text: 'კლიენტები'
    //   }
    // ]
  },
  {
    text: 'GENERAL.PRODUCTION',
    icon: 'manufacture',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    children: [
      {
        path: '/ingredients',
        text: 'GENERAL.INGREDIENTS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/receipt-templates',
        text: 'GENERAL.RECEIPT_TEMPLATES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/receipts',
        text: 'GENERAL.RECEIPTS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
      {
        path: '/production-orders',
        text: 'GENERAL.PRODUCTION_ORDERS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
      },
    ],
  },
  {
    text: 'GENERAL.ACCOUNTING',
    icon: 'stockholdings',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    isVisibleForAllLocations: false,
    children: [
      {
        path: '/history/sales',
        text: 'GENERAL.SALES',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/stockholdings',
        text: 'GENERAL.STOCK_HOLDINGS',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
    ],
  },
  {
    text: 'GENERAL.REPORTS',
    icon: 'history',
    isVisibleForAllLocations: true,
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    children: [
      {
        path: '/reports/sale-orders',
        text: 'GENERAL.TRANSACTIONS',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/reports/supplies',
        isVisibleForAllLocations: true,
        text: 'GENERAL.SUPPLIES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/reports/prices',
        text: 'GENERAL.PRICES',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/reports/withdrawals',
        text: 'GENERAL.WITHDRAWALS',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/reports/operators',
        text: 'GENERAL.SHIFTS',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
    ],
  },
  {
    text: 'GENERAL.GLOVO',
    icon: 'glovo',
    checkGlovoIntegration: true,
    isVisibleForAllLocations: true,
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    children: [
      {
        path: '/glovo-products',
        text: 'GENERAL.GLOVO_PRODUCTS',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/glovo-subcategories',
        isVisibleForAllLocations: true,
        text: 'GENERAL.GLOVO_SUBCATEGORIES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
    ],
  },
  {
    text: 'GENERAL.STATISTICS',
    icon: 'statistics',
    isVisibleForAllLocations: true,
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    children: [
      // {
      //   path: '/reports/general',
      //   text: 'ზოგადი',
      //   productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      // },
      {
        path: '/statistics/general',
        text: 'GENERAL.GENERAL',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        pageName: 'ზოგადი სტატისტიკა',
        translateId: 'GENERAL.GENERAL',
      },
      // {
      //   path: '/reports/product',
      //   text: 'პროდუქტები',
      //   productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      // },
      {
        path: '/statistics/products',
        text: 'GENERAL.PRODUCTS',
        isVisibleForAllLocations: true,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        pageName: 'პროდუქტების სტატისტიკა',
      },
      // {
      //   path: '/reports/category',
      //   text: 'კატეგორიები',
      //   productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      // },
      {
        path: '/statistics/categories',
        isVisibleForAllLocations: true,
        text: 'GENERAL.CATEGORIES',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        pageName: 'კატეგორიების სტატისტიკა',
      },
      // {
      //   path: '/reports/horeca/suppliers',
      //   text: 'მომწოდებლები',
      //   productTypes: [EOptimoProductType.HORECA],
      // },
      // {
      //   path: '/reports/operators',
      //   text: 'ცვლები',
      //   productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      // },
      // {
      //   path: '/reports/supplier',
      //   text: 'მომწოდებლები',
      //   icon: 'product'
      // },
      // {
      //   path: '/reports/sale-orders',
      //   text: 'ჩეკები',
      //   icon: 'product'
      // },
      // {
      //   path: '/reports/revenues',
      //   text: 'შემოსავლები',
      //   icon: 'product'
      // },
      // {
      //   path: '/reports/orders',
      //   text: 'შესყიდვები',
      //   icon: 'product'
      // }
    ],
  },
  {
    isVisibleForAllLocations: false,
    text: 'GENERAL.ADMINSTRATION',
    icon: 'settings',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
    children: [
      {
        path: '/profile',
        text: 'GENERAL.PROFILE',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/operators',
        text: 'GENERAL.WORKERS',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/locations',
        text: 'GENERAL.BRANCHES',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
      },
      {
        path: '/tables',
        text: 'GENERAL.TABLES',
        isVisibleForAllLocations: false,
        productTypes: [EOptimoProductType.HORECA],
      },
      {
        path: '/sub-users',
        text: 'GENERAL.SUB_USERS',
        productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
        isVisibleForAllLocations: false,
        allowedRoles: ['BO'],
      },
    ],
  },
  {
    path: '/tutorials',
    text: 'GENERAL.HELP',
    isVisibleForAllLocations: false,
    icon: 'tutorials',
    productTypes: [EOptimoProductType.Retail, EOptimoProductType.HORECA],
  },
];
