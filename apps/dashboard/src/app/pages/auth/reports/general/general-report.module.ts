import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralReportComponent } from './general-report.component';
import { Routes, RouterModule } from '@angular/router';
import { GeneralReportCardsComponent } from './cards/general-report-cards.component';
import { GeneralReportSoldChartComponent } from './sold-chart/general-report-sold-chart.component';
import { GeneralReportSaleOrdersChartComponent } from './sale-orders-chart/general-report-sale-orders-chart.component';
import { FormsModule } from '@angular/forms';
import { ChartModule } from '@optimo/ui-chart';
import { CircleProgressModule } from '@optimo/ui-circle-progress';
import { YearSelectModule } from '@optimo/ui-year-select';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { IconModule } from '@optimo/ui-icon';

const routes: Routes = [
  {
    path: '',
    component: GeneralReportComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ChartModule,
    CircleProgressModule,
    YearSelectModule,
    DatePickerModule,
    ClickOutsideModule,
    IconModule,
  ],
  declarations: [
    GeneralReportComponent,
    GeneralReportCardsComponent,
    GeneralReportSoldChartComponent,
    GeneralReportSaleOrdersChartComponent,
  ],
})
export class GeneralReportModule {}
