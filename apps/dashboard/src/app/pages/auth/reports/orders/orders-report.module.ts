import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OrdersReportComponent } from './orders-report.component';
import { OrdersReportCardsComponent } from './cards/orders-report-cards.component';
import { OrdersReportChartComponent } from './chart/orders-report-chart.component';
import { OrdersReportGridsComponent } from './grids/orders-report-grids.component';
import { TableModule } from '@optimo/ui-table';
import { ChartModule } from '@optimo/ui-chart';

const routes: Routes = [
  {
    path: '',
    component: OrdersReportComponent,
  },
];

@NgModule({
  declarations: [
    OrdersReportComponent,
    OrdersReportCardsComponent,
    OrdersReportChartComponent,
    OrdersReportGridsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ChartModule,
  ],
})
export class OrdersReportModule {}
