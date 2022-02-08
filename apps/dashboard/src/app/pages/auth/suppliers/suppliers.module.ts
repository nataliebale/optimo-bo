import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { SuppliersRoutingModule } from './suppliers-routing.module';
import { SuppliersComponent } from './suppliers.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { ViewSupplierModule } from './view-supplier/view-supplier.module';
import { SuppliersTransactionPopupComponent } from './transaction-popup/suppliers-transaction-popup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SuppliersImportPopupComponent } from './suppliers-import/suppliers-import-popup.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SuppliersComponent,
    SuppliersTransactionPopupComponent,
    SuppliersImportPopupComponent,
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    SuppliersRoutingModule,
    TableModule,
    IconModule,
    ApproveDialogModule,
    ViewSupplierModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatTooltipModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [
    SuppliersTransactionPopupComponent,
    SuppliersImportPopupComponent,
  ],
  providers: [MatDatepickerModule],
})
export class SuppliersModule {}
