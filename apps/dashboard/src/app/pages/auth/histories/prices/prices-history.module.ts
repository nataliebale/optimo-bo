import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from '@optimo/ui-table';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PricesHistoryComponent } from './prices-history.component';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { IconModule } from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: PricesHistoryComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    DatePickerModule,
    IconModule,
    ClickOutsideModule,
	TranslateModule.forChild()
  ],
  declarations: [PricesHistoryComponent],
})
export class PricesHistoryModule {}
