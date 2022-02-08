import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconServiceConfig } from './icon.component';
import { IconProductComponent } from './product/icon-product.component';
import { IconPlusComponent } from './plus/icon-plus.component';
import { IconPlusTblsComponent } from './plus-tbls/icon-plus-tbls.component';
import { IconArrowDownComponent } from './arrow-down/icon-arrow-down.component';
import { IconTrashComponent } from './trash/icon-trash.component';
import { IconEditComponent } from './edit/icon-edit.component';
import { IconEditTblsComponent } from './edit-tbls/icon-edit-tbls.component';
import { IconCloseComponent } from './close/icon-close.component';
import { IconSortUpComponent } from './sort-up/icon-sort-up.component';
import { IconSortDownComponent } from './sort-down/icon-sort-down.component';
import { IconArrowRightComponent } from './arrow-right/icon-arrow-right.component';
import { IconSearchComponent } from './search/icon-search.component';
import { IconCalendarComponent } from './calendar/icon-calendar.component';
import { IconPhotoCameraComponent } from './photo-camera/icon-photo-camera.component';
import { IconProfitComponent } from './profit/icon-profit.component';
import { IconLoseComponent } from './lose/icon-lose.component';
import { IconAddComponent } from './add/icon-add.component';
import { IconMoveComponent } from './move/icon-move.component';
import { IconAlertPriceChangeComponent } from './alert-price-change/icon-alert-price-change.component';
import { IconGelComponent } from './gel/icon-gel.component';
import { IconDollarComponent } from './dollar/icon-dollar.component';
import { IconToggleGelComponent } from './toggle-gel/icon-toggle-gel.component';
import { IconPencilComponent } from './pencil/icon-pencil.component';
import { IconBackComponent } from './back/icon-back.component';
import { IconSaveComponent } from './save/icon-save.component';
import { IconDoneComponent } from './done/icon-done.component';
import { IconDashboardCalendarComponent } from './dashboard-calendar/icon-dashboard-calendar.component';
import { IconDashboardComponent } from './dashboard/icon-dashboard.component';
import { IconCategoriesComponent } from './categories/icon-categories.component';
import { IconSuppliersComponent } from './suppliers/icon-suppliers.component';
import { IconOrdersComponent } from './orders/icon-orders.component';
import { IconCashiersComponent } from './cashiers/icon-cashiers.component';
import { IconHistoryComponent } from './history/icon-history.component';
import { IconStatisticsComponent } from './statistics/icon-statistics.component';
import { IconRsComponent } from './rs/icon-rs.component';
import { IconStockHoldingsComponent } from './stockholdings/icon-stock-holdings.component';
import { IconSettingsComponent } from './settings/icon-settings.component';
import { IconEyeComponent } from './eye/icon-eye.component';
import { IconReloadComponent } from './reload/icon-reload.component';
import { IconProductReportsCardTotalComponent } from './product-reports-card-total/icon-product-reports-card-total.component';
import { IconProductReportsCardAverageComponent } from './product-reports-card-average/icon-product-reports-card-average.component';
import { IconProductReportsCardAveragePurchaseComponent } from './product-reports-card-average-purchase/icon-product-reports-card-average-purchase.component';
import { IconAverageReceiptComponent } from './average-receipt/icon-average-receipt.component';
import { IconResendComponent } from './resend/icon-resend.component';
import { IconSuccessComponent } from './success/icon-success.component';
import { IconLogoutComponent } from './logout/icon-logout.component';
import { IconImportComponent } from './import/icon-import.component';
import { IconMailComponent } from './mail/icon-mail.component';
import { IconPhoneComponent } from './phone/icon-phone.component';
import { IconNoDataComponent } from './no-data/icon-no-data.component';
import { IconEurComponent } from './eur/icon-eur.component';
import { IconExcelComponent } from './excel/icon-excel.component';
import { IconAlertComponent } from './alert/icon-alert.component';
import { IconLoadingComponent } from './loading/icon-loading.component';
import { IconInfoComponent } from './info/icon-info.component';
import { IconLocationComponent } from './location/icon-location.component';
import { IconExternalLinkComponent } from './external-link/icon-external-link.component';
import { IconSidebarCloseComponent } from './sidebar-close/icon-sidebar-close.component';
import { IconBurgerComponent } from './burger/icon-burger.component';
import { IconScaleComponent } from './scale/icon-scale.component';
import { IconLotsComponent } from './lots/icon-lots.component';
import { IconSellComponent } from './sell/icon-sell.component';
import { IconSyncComponent } from './sync/icon-sync.component';
import { IconWarnComponent } from './warn/icon-warn.component';
import { IconEntitySalesComponent } from './entity-sales/icon-entity-sales.component';
import { IconTutorialsComponent } from './tutorials/icon-tutorials.component';
import { IconBarcodeComponent } from './barcode/icon-barcode.component';
import { IconSaleComponent } from './sale/icon-sale.component';
import { IconManufactureComponent } from './manufacture/icon-manufacture.component';
import { IconDownloadComponent } from './download/download.component';
import { IconNextStepComponent } from './next-step/icon-next-step.component';
import { VisibilityOffComponent } from './visibilityOff/visibilityOff.component';
import { VisibilityComponent } from './visibility/visibility.component';
import { IconArrowDownTblsComponent } from './arrow-down-tbls/icon-arrow-down-tbls.component';
import { IconArrowDownSidebarComponent } from './arrow-down-sidebar/icon-arrow-down-sidebar.component';
import { IconBurgerAdminComponent } from './burger-admin/icon-burger-admin.component';
import { IconSidebarAdminComponent } from './sidebar-admin/icon-sidebar-admin.component';
import { IconOffersAdminComponent } from './offers-admin/icon-offers-admin.component';
import { IconTutorialsAdminComponent } from './tutorials-admin/icon-tutorials-admin.component';
import { IconCloseAdminComponent } from './close-admin/icon-close-admin.component';
import { IconAlertAdminComponent } from './alert-admin/icon-alert-admin.component';
import { IconFavoritesComponent } from './favorites/icon-favorites.component';
import { IconMoreDotsComponent } from './more-dots/icon-more-dots.component';
import { IconColumnAddComponent } from './column-add/icon-column-add.component';
import { IconOrderReceiveComponent } from './order-receive/icon-order-receive.component';
import { IconOrderDublicateComponent } from './order-dublicate/icon-order-dublicate.component';
import { IconArrowsUpDownComponent } from './arrows-up-down/icon-arrows-up-down.component';
import { IconCorrectBorderedComponent } from './correct-bordered/icon-correct-bordered.component';
import { IconKeyComponent } from './key/icon-key.component';
import { IconCheckedGreenComponent } from './checked-green/icon-checked-green.component';
import { IconFilterResetComponent } from './filter-reset/icon-filter-reset.component';
import { IconLoaderBigComponent } from './loader-big/icon-loader-big.component';
import { IconShippingComponent } from './shipping/icon-shipping.component';
import { IconEmptyStarComponent } from './empty-star/icon-empty-star.component';
import { IconFullStarComponent } from './full-star/icon-full-star.component';
import { IconOutlineStarComponent } from './outline-star/icon-outline-star.component';
import { IconInfoBlueComponent } from './info-blue/icon-info-blue.component';
import { IconNoDataStatsComponent } from './no-data-stats/icon-no-data-stats.component';
import { IconArrowRightMoreComponent } from './arrow-right-more/icon-arrow-right-more.component';
import { IconFormExchangeComponent } from './form-exchange/icon-form-exchange.component';
import { IconTrashTblsComponent } from './trash-tbls/icon-trash-tbls.component';
import { IconCashLariComponent } from './cash-lari/icon-cash-lari.component';
import { IconSellFilledComponent } from './sell-filled/icon-sell-filled.component';
import { IconBlockAdminComponent } from './block-admin/icon-block-admin.component';
import { IconUnblockAdminComponent } from './unblock-admin/icon-unblock-admin.component';
import { IconSubmitAdminComponent } from './submit-admin/icon-submit-admin.component';
import { IconUploadComponent } from './upload/icon-upload.component';
import { IconLinkOpenComponent } from './link-open/icon-link-open.component';
import { IconMainAdminComponent } from './main-admin/icon-main-admin.component';
import { IconUsersAdminComponent } from './users-admin/icon-users-admin.component';
import { IconCompaniesAdminComponent } from './companies-admin/icon-companies-admin.component';
import { IconDevicesAdminComponent } from './devices-admin/icon-devices-admin.component';
import { IconRegistrationsAdminComponent } from './registrations-admin/icon-registrations-admin.component';
import { IconDemosAdminComponent } from './demos-admin/icon-demos-admin.component';
import { IconBusinessesTypesAdminComponent } from './businesses-types-admin/icon-businesses-types-admin.component';
import { IconFaqAdminComponent } from './faq-admin/icon-faq-admin.component';
import { IconCatalogueAdminComponent } from './catalogue-admin/icon-catalogue-admin.component';
import { IconAttributesAdminComponent } from './attributes-admin/icon-attributes-admin.component';
import { IconSuppliersAdminComponent } from './suppliers-admin/icon-suppliers-admin.component';
import { IconAdminsComponent } from './admins/icon-admins.component';
import { IconVideoLessonsAdminComponent } from './video-lessons-admin/icon-video-lessons-admin.component';
import { IconCloseTablesComponent } from './close-tables/icon-close-tables.component';
import { IconFormUploadComponent } from './form-upload/icon-form-upload.component';
import { IconNotificationComponent } from './notification/icon-notification.component';
import { IconYellowFlagComponent } from './yellow-flag/icon-yellow-flag.component';
import { IconStatusCorrectedComponent } from './status-corrected/icon-status-corrected.component';
import { IconStatusRefundedComponent } from './status-refunded/icon-status-refunded.component';
import { IconNotificationAdminComponent } from './notification-admin/icon-notification-admin.component';
import { IconMultiplyComponent } from './multiply/icon-multiply.component';
import { IconExcelDownloadComponent } from './excel-download/icon-excel-download.component';
import { IconNotAllowedComponent } from './not-allowed/icon-not-allowed.component';
import { IconGlovoComponent } from './glovo/icon-glovo.component';
import { IconLinkOpenSuppliersComponent } from './link-open-suppliers/icon-link-open-suppliers.component';
import { IconGoToBranchComponent } from './go-to-branch/go-to-branch.component';

const ENTRY_COMPONENTS = [
  IconProductComponent,
  IconArrowDownComponent,
  IconLoaderBigComponent,
  IconOrderReceiveComponent,
  IconCorrectBorderedComponent,
  IconArrowRightMoreComponent,
  IconFilterResetComponent,
  IconColumnAddComponent,
  IconMoreDotsComponent,
  IconSellFilledComponent,
  IconPlusComponent,
  IconPlusTblsComponent,
  IconTrashComponent,
  IconEditComponent,
  IconEditTblsComponent,
  IconKeyComponent,
  IconCloseAdminComponent,
  IconTrashTblsComponent,
  IconCloseComponent,
  IconSortUpComponent,
  IconNextStepComponent,
  IconSortDownComponent,
  IconSearchComponent,
  IconCalendarComponent,
  IconArrowRightComponent,
  IconPhotoCameraComponent,
  IconArrowDownTblsComponent,
  IconArrowDownSidebarComponent,
  IconArrowsUpDownComponent,
  IconInfoBlueComponent,
  IconProfitComponent,
  IconLoseComponent,
  IconAddComponent,
  IconMoveComponent,
  IconAlertPriceChangeComponent,
  IconBurgerAdminComponent,
  IconGelComponent,
  IconDollarComponent,
  IconToggleGelComponent,
  IconPencilComponent,
  IconBackComponent,
  IconSaveComponent,
  IconDoneComponent,
  IconDashboardCalendarComponent,
  IconDashboardComponent,
  IconCategoriesComponent,
  IconNoDataStatsComponent,
  IconSuppliersComponent,
  IconOrdersComponent,
  IconCashiersComponent,
  IconHistoryComponent,
  IconStatisticsComponent,
  IconRsComponent,
  IconStockHoldingsComponent,
  IconFavoritesComponent,
  IconSettingsComponent,
  IconEyeComponent,
  IconReloadComponent,
  IconCheckedGreenComponent,
  IconProductReportsCardTotalComponent,
  IconProductReportsCardAverageComponent,
  IconProductReportsCardAveragePurchaseComponent,
  IconAverageReceiptComponent,
  IconResendComponent,
  IconAlertAdminComponent,
  IconSuccessComponent,
  IconLogoutComponent,
  IconImportComponent,
  IconSaleComponent,
  IconMailComponent,
  IconPhoneComponent,
  IconNoDataComponent,
  IconSellComponent,
  IconEurComponent,
  IconExcelComponent,
  IconAlertComponent,
  IconInfoComponent,
  IconLoadingComponent,
  IconFullStarComponent,
  IconLocationComponent,
  IconExternalLinkComponent,
  IconTutorialsAdminComponent,
  IconOrderDublicateComponent,
  IconSidebarAdminComponent,
  IconSidebarCloseComponent,
  IconLinkOpenComponent,
  IconEmptyStarComponent,
  IconOffersAdminComponent,
  IconFormExchangeComponent,
  IconCashLariComponent,
  IconOutlineStarComponent,
  IconUsersAdminComponent,
  IconBurgerComponent,
  IconScaleComponent,
  IconLotsComponent,
  IconSyncComponent,
  IconWarnComponent,
  IconDownloadComponent,
  IconBlockAdminComponent,
  IconUnblockAdminComponent,
  IconSubmitAdminComponent,
  IconEntitySalesComponent,
  IconTutorialsComponent,
  IconBarcodeComponent,
  IconManufactureComponent,
  IconShippingComponent,
  IconMainAdminComponent,
  IconUploadComponent,
  VisibilityOffComponent,
  VisibilityComponent,
  IconCompaniesAdminComponent,
  IconDevicesAdminComponent,
  IconRegistrationsAdminComponent,
  IconDemosAdminComponent,
  IconBusinessesTypesAdminComponent,
  IconFaqAdminComponent,
  IconCatalogueAdminComponent,
  IconAttributesAdminComponent,
  IconSuppliersAdminComponent,
  IconAdminsComponent,
  IconVideoLessonsAdminComponent,
  IconCloseTablesComponent,
  IconFormUploadComponent,
  IconNotificationComponent,
  IconYellowFlagComponent,
  IconNotificationAdminComponent,
  IconMultiplyComponent,
  IconNotAllowedComponent,
  IconExcelDownloadComponent,
  IconStatusCorrectedComponent,
  IconStatusRefundedComponent,
  IconGlovoComponent,
  IconLinkOpenSuppliersComponent,
  IconGoToBranchComponent,
];

@NgModule({
  declarations: [IconComponent, ...ENTRY_COMPONENTS],
  imports: [CommonModule],
  exports: [IconComponent, ...ENTRY_COMPONENTS],
  entryComponents: ENTRY_COMPONENTS,
  providers: [
    {
      provide: IconServiceConfig,
      useValue: {
        rs: IconRsComponent,
        add: IconAddComponent,
        move: IconMoveComponent,
        eur: IconEurComponent,
        eye: IconEyeComponent,
        gel: IconGelComponent,
        info: IconInfoComponent,
        key: IconKeyComponent,
        sale: IconSaleComponent,
        lose: IconLoseComponent,
        plus: IconPlusComponent,
        edit: IconEditComponent,
        back: IconBackComponent,
        done: IconDoneComponent,
        lots: IconLotsComponent,
        mail: IconMailComponent,
        save: IconSaveComponent,
        scale: IconScaleComponent,
        sell: IconSellComponent,
        sync: IconSyncComponent,
        alert: IconAlertComponent,
        excel: IconExcelComponent,
        phone: IconPhoneComponent,
        close: IconCloseComponent,
        trash: IconTrashComponent,
        burger: IconBurgerComponent,
        logout: IconLogoutComponent,
        reload: IconReloadComponent,
        resend: IconResendComponent,
        dollar: IconDollarComponent,
        download: IconDownloadComponent,
        search: IconSearchComponent,
        import: IconImportComponent,
        profit: IconProfitComponent,
        pencil: IconPencilComponent,
        orders: IconOrdersComponent,
        loading: IconLoadingComponent,
        location: IconLocationComponent,
        success: IconSuccessComponent,
        product: IconProductComponent,
        history: IconHistoryComponent,
        calendar: IconCalendarComponent,
        settings: IconSettingsComponent,
        manufacture: IconManufactureComponent,
        cashiers: IconCashiersComponent,
        dashboard: IconDashboardComponent,
        suppliers: IconSuppliersComponent,
        categories: IconCategoriesComponent,
        statistics: IconStatisticsComponent,
        stockholdings: IconStockHoldingsComponent,
        warn: IconWarnComponent,
        tutorials: IconTutorialsComponent,
        favorites: IconFavoritesComponent,
        barcode: IconBarcodeComponent,
        hidden: VisibilityOffComponent,
        upload: IconUploadComponent,
        show: VisibilityComponent,
        shipping: IconShippingComponent,
        admins: IconAdminsComponent,
        notification: IconNotificationComponent,
        multiply: IconMultiplyComponent,
        glovo: IconGlovoComponent,
        'notification-admin': IconNotificationAdminComponent,
        'yellow-flag': IconYellowFlagComponent,
        'video-lessons-admin': IconVideoLessonsAdminComponent,
        'suppliers-admin': IconSuppliersAdminComponent,
        'attributes-admin': IconAttributesAdminComponent,
        'catalogue-admin': IconCatalogueAdminComponent,
        'faq-admin': IconFaqAdminComponent,
        'businesses-types-admin': IconBusinessesTypesAdminComponent,
        'demos-admin': IconDemosAdminComponent,
        'registrations-admin': IconRegistrationsAdminComponent,
        'devices-admin': IconDevicesAdminComponent,
        'users-admin': IconUsersAdminComponent,
        'companies-admin': IconCompaniesAdminComponent,
        'main-admin': IconMainAdminComponent,
        'link-open': IconLinkOpenComponent,
        'submit-admin': IconSubmitAdminComponent,
        'block-admin': IconBlockAdminComponent,
        'unblock-admin': IconUnblockAdminComponent,
        'sell-filled': IconSellFilledComponent,
        'outline-star': IconOutlineStarComponent,
        'trash-tbls': IconTrashTblsComponent,
        'info-blue': IconInfoBlueComponent,
        'cash-lari': IconCashLariComponent,
        'full-star': IconFullStarComponent,
        'empty-star': IconEmptyStarComponent,
        'filter-reset': IconFilterResetComponent,
        'loader-big': IconLoaderBigComponent,
        'order-receive': IconOrderReceiveComponent,
        'checked-green': IconCheckedGreenComponent,
        'order-dublicate': IconOrderDublicateComponent,
        'column-add': IconColumnAddComponent,
        'burger-admin': IconBurgerAdminComponent,
        'more-dots': IconMoreDotsComponent,
        'alert-admin': IconAlertAdminComponent,
        'close-admin': IconCloseAdminComponent,
        'correct-bordered': IconCorrectBorderedComponent,
        'sidebar-admin': IconSidebarAdminComponent,
        'offers-admin': IconOffersAdminComponent,
        'tutorials-admin': IconTutorialsAdminComponent,
        'form-exchange': IconFormExchangeComponent,
        'no-data': IconNoDataComponent,
        'edit-tbls': IconEditTblsComponent,
        'plus-tbls': IconPlusTblsComponent,
        'sort-up': IconSortUpComponent,
        'sort-down': IconSortDownComponent,
        'next-step': IconNextStepComponent,
        'toggle-gel': IconToggleGelComponent,
        'arrow-down': IconArrowDownComponent,
        'arrow-right-more': IconArrowRightMoreComponent,
        'arrow-down-tbls': IconArrowDownTblsComponent,
        'arrow-down-sidebar': IconArrowDownSidebarComponent,
        'arrows-up-down': IconArrowsUpDownComponent,
        'arrow-right': IconArrowRightComponent,
        'photo-camera': IconPhotoCameraComponent,
        'sidebar-close': IconSidebarCloseComponent,
        'external-link': IconExternalLinkComponent,
        'alert-price': IconAlertPriceChangeComponent,
        'dashboard-calendar': IconCalendarComponent,
        'average-receipt': IconAverageReceiptComponent,
        'product-total': IconProductReportsCardTotalComponent,
        'product-average': IconProductReportsCardAverageComponent,
        'product-average-purchase': IconProductReportsCardAveragePurchaseComponent,
        'no-data-stats': IconNoDataStatsComponent,
        'entity-sales': IconEntitySalesComponent,
        'status-corrected': IconStatusCorrectedComponent,
        'status-refunded': IconStatusRefundedComponent,
        'close-tables': IconCloseTablesComponent,
        'form-upload': IconFormUploadComponent,
        'excel-download': IconExcelDownloadComponent,
        'not-allowed': IconNotAllowedComponent,
        'open-link-suppliers': IconLinkOpenSuppliersComponent,
        'go-to-branch': IconGoToBranchComponent
      },
    },
  ],
})
export class IconModule {}
