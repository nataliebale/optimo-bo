import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaleOrdersReportComponent } from './sale-orders-report.component';
import { Routes, RouterModule } from '@angular/router';
import { SaleOrdersReportCardsComponent } from './cards/sale-orders-report-cards.component';
import { SaleOrdersReportPieChartComponent } from './pie-chart/sale-orders-report-pie-chart.component';
import { SaleOrdersReportLineChartComponent } from './line-chart/sale-orders-report-line-chart.component';
import { ChartModule } from '@optimo/ui-chart';

const routes: Routes = [
  {
    path: '',
    component: SaleOrdersReportComponent,
  },
];

@NgModule({
  declarations: [
    SaleOrdersReportComponent,
    SaleOrdersReportCardsComponent,
    SaleOrdersReportLineChartComponent,
    SaleOrdersReportPieChartComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), ChartModule],
})
export class SaleOrdersReportModule {}
