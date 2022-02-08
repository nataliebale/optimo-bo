import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesReportComponent } from './categories-report.component';
import { FormsModule } from '@angular/forms';
import { TableModule } from '@optimo/ui-table';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesReportCardComponent } from './card/categories-report-card.component';
import { CategoriesReportGridsComponent } from './grids/categories-report-grids.component';
import { IconModule } from '@optimo/ui-icon';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriesReportGridTableComponent } from './grids/categories-report-grid-table/categories-report-grid-table.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';

const routes: Routes = [
  {
    path: '',
    component: CategoriesReportComponent,
  },
];

@NgModule({
  declarations: [
    CategoriesReportComponent,
    CategoriesReportCardComponent,
    CategoriesReportGridsComponent,
    CategoriesReportGridTableComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    TableModule,
    DynamicSelectModule,
    IconModule,
    DatePickerModule,
    MatTooltipModule,
    ClickOutsideModule,
  ],
})
export class CategoriesReportModule {}
