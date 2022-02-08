import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LotsHistoryComponent } from './lots-history.component';
import { FormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { RouterModule, Routes } from '@angular/router';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconModule } from '@optimo/ui-icon';
import { LotsHistoryGeneralComponent } from './general/lots-history-general.component';
import { LotsHistorySpecificComponent } from './specific/lots-history-specific.component';
import { TableModule } from '@optimo/ui-table';
import { LotsHistoryCardComponent } from './specific/card/lots-history-card.component';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: LotsHistoryComponent,
    children: [
      {
        path: '',
        redirectTo: 'general',
      },
      {
        path: 'general',
        component: LotsHistoryGeneralComponent,
      },

      {
        path: 'specific',
        component: LotsHistorySpecificComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    LotsHistoryComponent,
    LotsHistoryGeneralComponent,
    LotsHistorySpecificComponent,
    LotsHistoryCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    DynamicSelectModule,
    DatePickerModule,
    MatTooltipModule,
    ClickOutsideModule,
    IconModule,
	TableModule,
	 
    TranslateModule.forChild(),
  ],
})
export class LotsHistoryModule {}
