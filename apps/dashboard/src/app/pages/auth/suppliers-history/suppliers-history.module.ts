import { TableModule } from '@optimo/ui-table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { TranslateModule } from '@ngx-translate/core';
import { SuppliersHistoryComponent } from './suppliers-history.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SuppliersHistoryTransactionPopupComponent } from './transaction-popup/suppliers-history-transaction-popup.component';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ViewSupplierModule } from '../suppliers/view-supplier/view-supplier.module';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [
  {
    path: '',
    component: SuppliersHistoryComponent,
  },
];

@NgModule({
  declarations: [
    SuppliersHistoryComponent,
    SuppliersHistoryTransactionPopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IconModule,
    MatDialogModule,
    TableModule,
    ApproveDialogModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatTooltipModule,
    DynamicSelectModule,
    DatePickerModule,
    ViewSupplierModule,
    NgxMaskModule.forRoot(),
    TranslateModule.forChild(),
  ],
  entryComponents: [SuppliersHistoryTransactionPopupComponent],
  providers: [MatDatepickerModule],
})
export class SuppliersHistoryModule {}
