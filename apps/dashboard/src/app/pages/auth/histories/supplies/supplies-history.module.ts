import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliesHistoryComponent } from './supplies-history.component';
import { TableModule } from '@optimo/ui-table';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewCategoryModule } from '../../categories/view-category/view-category.module';
import { ViewSupplierModule } from '../../suppliers/view-supplier/view-supplier.module';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { IconModule } from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SuppliesHistoryComponent,
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
  declarations: [SuppliesHistoryComponent],
})
export class SuppliesHistoryModule {}
