import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierReportComponent } from './supplier-report.component';
import { FormsModule } from '@angular/forms';
import { SupplierReportChartComponent } from './chart/supplier-report-chart.component';
import { TableModule } from '@optimo/ui-table';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { Routes, RouterModule } from '@angular/router';
import { SupplierReportCardsComponent } from './cards/supplier-report-cards.component';
import { SupplierReportGridsComponent } from './grids/supplier-report-grids.component';
import { ChartModule } from '@optimo/ui-chart';

const routes: Routes = [
  {
    path: '',
    component: SupplierReportComponent,
  },
];

@NgModule({
  declarations: [
    SupplierReportComponent,
    SupplierReportChartComponent,
    SupplierReportCardsComponent,
    SupplierReportGridsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    TableModule,
    DynamicSelectModule,
    ChartModule,
  ],
})
export class SupplierReportModule {}
