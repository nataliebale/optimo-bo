import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductReportComponent } from './product-report.component';
import { FormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { RouterModule, Routes } from '@angular/router';
import { ProductReportCardsComponent } from './cards/product-report-cards.component';
import { ChartModule } from '@optimo/ui-chart';
import { ProductReportDetailCardComponent } from './cards/detail-card/product-report-detail-card.component';
import { CircleProgressModule } from '@optimo/ui-circle-progress';
import { YearSelectModule } from '@optimo/ui-year-select';
import { ProductReportStockChartComponent } from './stock-chart/product-report-stock-chart.component';
import { ProductReportSoldChartComponent } from './sold-chart/product-report-sold-chart.component';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconModule } from '@optimo/ui-icon';

const routes: Routes = [
  {
    path: '',
    component: ProductReportComponent,
  },
];

@NgModule({
  declarations: [
    ProductReportComponent,
    ProductReportCardsComponent,
    ProductReportDetailCardComponent,
    ProductReportStockChartComponent,
    ProductReportSoldChartComponent,
    ProductReportDetailCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    DynamicSelectModule,
    ChartModule,
    CircleProgressModule,
    YearSelectModule,
    DatePickerModule,
    MatTooltipModule,
    ClickOutsideModule,
    IconModule,
  ],
})
export class ProductReportModule {}
