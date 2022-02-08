import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithdrawalsReportComponent } from './withdrawals-report.component';
import { Routes, RouterModule } from '@angular/router';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { IconModule } from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: WithdrawalsReportComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    DatePickerModule,
    IconModule,
    ClickOutsideModule,
	TranslateModule.forChild()
  ],
  declarations: [WithdrawalsReportComponent],
})
export class WithdrawalsReportModule {}
