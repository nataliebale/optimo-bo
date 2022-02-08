import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { IconModule } from '@optimo/ui-icon';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { DateChartComponent } from './components/date-chart/date-chart.component';
import { ColumnChartComponent } from './components/column-chart/column-chart.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GeneralComponent } from './containers/general/general.component';
import { ProductComponent } from './containers/product/product.component';
import { CategoryComponent } from './containers/category/category.component';
import { IsMoneyPipe } from './pipes/is-money/is-money.pipe';
import { PercentagePipe } from './pipes/percentage/percentage.pipe';
import {MatTabsModule} from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    redirectTo: 'general',
  },
  {
    path: 'general',
    component: GeneralComponent,
    data: {
      hotjarEventName: 'General Statistics',
    }
  },
  {
    path: 'products',
    component: ProductComponent,
    data: {
      hotjarEventName: 'Products Statistics',
    }
  },
  {
    path: 'categories',
    component: CategoryComponent,
    data: {
      hotjarEventName: 'Category Statistics',
    }
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    DatePickerModule,
    ClickOutsideModule,
    DynamicSelectModule,
    IconModule,
    MatTooltipModule,
    MatTabsModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    LineChartComponent,
    DateChartComponent,
    ColumnChartComponent,
    TabsComponent,
    GeneralComponent,
    ProductComponent,
    CategoryComponent,
    IsMoneyPipe,
    PercentagePipe,
  ],
})
export class HorecaReportModule {}
