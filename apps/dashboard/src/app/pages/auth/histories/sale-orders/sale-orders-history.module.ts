import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleOrdersHistoryComponent } from './sale-orders-history.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { MatDialogModule } from '@angular/material/dialog';
import { SaleOrdersHistoryRetailComponent } from './retail/sale-orders-history-retail.component';
import { SaleOrdersHistoryEntityComponent } from './entity/sale-orders-history-entity.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { ViewSaleOrdersHistoryRetailComponent } from './retail/view/view-sale-orders-history-retail.component';
import { ViewSaleOrdersHistoryEntityComponent } from './entity/view/view-sale-orders-history-entity.component';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SaleOrdersHistoryComponent,
    children: [
      {
        path: '',
        redirectTo: 'retail',
      },
      {
        path: 'retail',
        component: SaleOrdersHistoryRetailComponent,
        data: {
          hotjarEventName: 'Transactions Retail sales'
        }
      },
      {
        path: 'entity',
        component: SaleOrdersHistoryEntityComponent,
        data: {
          hotjarEventName: 'Transactions B2B sales'
        }
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    IconModule,
    DatePickerModule,
    MatDialogModule,
    ClickOutsideModule,
    UiViewAttributesModule,
	TranslateModule.forChild()
  ],
  entryComponents: [
    ViewSaleOrdersHistoryRetailComponent,
    ViewSaleOrdersHistoryEntityComponent,
  ],
  declarations: [
    SaleOrdersHistoryComponent,
    SaleOrdersHistoryRetailComponent,
    SaleOrdersHistoryEntityComponent,
    ViewSaleOrdersHistoryRetailComponent,
    ViewSaleOrdersHistoryEntityComponent,
  ],
})
export class SaleOrdersHistoryModule {}
