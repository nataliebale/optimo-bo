import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesHistoryComponent } from './sales-history.component';
import { Routes, RouterModule } from '@angular/router';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewSupplierModule } from '../../suppliers/view-supplier/view-supplier.module';
import { ViewCategoryModule } from '../../categories/view-category/view-category.module';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { IconModule } from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { SalesHistoryEntityComponent } from './entity/sales-history-entity.component';
import { SalesHistoryRetailComponent } from './retail/sales-history-retail.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SalesHistoryComponent,
    children: [
      {
        path: '',
        redirectTo: 'retail',
      },
      {
        path: 'retail',
        component: SalesHistoryRetailComponent,
      },

      {
        path: 'entity',
        component: SalesHistoryEntityComponent,
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
    ViewCategoryModule,
    ViewSupplierModule,
    DatePickerModule,
    IconModule,
    ClickOutsideModule,
	TranslateModule.forChild()
  ],
  declarations: [
    SalesHistoryComponent,
    SalesHistoryRetailComponent,
    SalesHistoryEntityComponent,
  ],
})
export class SalesHistoryModule {}
