import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { MatDialogModule } from '@angular/material/dialog';
import { PopularProductsComponent } from './popular-products.component';
import { PopularProductsRevenueComponent } from './revenue/popular-products-revenue.component';
import { PopularProductsIncomeComponent } from './income/popular-products-income.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: PopularProductsComponent,
    children: [
      {
        path: '',
        redirectTo: 'revenue',
      },
      {
        path: 'revenue',
        component: PopularProductsRevenueComponent,
      },

      {
        path: 'income',
        component: PopularProductsIncomeComponent,
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
    TranslateModule.forChild(),
  ],
  declarations: [
    PopularProductsComponent,
    PopularProductsRevenueComponent,
    PopularProductsIncomeComponent,
  ],
})
export class PopularProductsModule {}
