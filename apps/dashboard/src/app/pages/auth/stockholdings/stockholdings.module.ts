import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockholdingsComponent } from './stockholdings.component';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: StockholdingsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DatePickerModule,
    MatTooltipModule,
    IconModule,
    ClickOutsideModule,
	TranslateModule.forChild()
  ],
  declarations: [StockholdingsComponent],
})
export class StockholdingsModule {}
