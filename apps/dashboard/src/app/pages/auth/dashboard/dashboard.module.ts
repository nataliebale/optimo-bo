import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { Routes, RouterModule } from '@angular/router';
import { DashboardGridsComponent } from './grids/dashboard-grids.component';
import { DashboardCardsComponent } from './dashboard-cards/dashboard-cards.component';
import { ChartModule } from '@optimo/ui-chart';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { IconModule } from '@optimo/ui-icon';
import { TranslateModule } from '@ngx-translate/core';
 
const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardGridsComponent,
    DashboardCardsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatInputModule,
    MatButtonModule,
    TableModule,
    ChartModule,
    DatePickerModule,
    ClickOutsideModule,
    MatTooltipModule,
    IconModule,
    TranslateModule.forChild(),
  ]
})
export class DashboardModule {}
