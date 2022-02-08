import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenuesReportComponent } from './revenues-report.component';
import { RevenuesReportLineChartComponent } from './line-chart/revenues-report-line-chart.component';
import { RevenuesReportCardsComponent } from './cards/revenues-report-cards.component';
import { Routes, RouterModule } from '@angular/router';
import { RevenuesReportPieChartsComponent } from './pie-charts/revenues-report-pie-charts.component';
import { ChartModule } from '@optimo/ui-chart';

const routes: Routes = [
  {
    path: '',
    component: RevenuesReportComponent,
  },
];

@NgModule({
  declarations: [
    RevenuesReportComponent,
    RevenuesReportCardsComponent,
    RevenuesReportLineChartComponent,
    RevenuesReportPieChartsComponent,
  ],
  imports: [CommonModule, RouterModule.forChild(routes), ChartModule],
})
export class RevenuesReportModule {}
