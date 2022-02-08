import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AddSupplierComponent } from './add-supplier.component';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { AddSupplierStockitemsComponent } from './add-supplier-stockitems/add-supplier-stockitems.component';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
 

@NgModule({
  declarations: [AddSupplierComponent, AddSupplierStockitemsComponent],
  entryComponents: [AddSupplierComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    DynamicSelectModule,
    TableModule,
    BottomSheetDispacherModule.forRoot(AddSupplierComponent),
    ApproveDialogModule,
    IconModule,
	MatTooltipModule,
	 
    NgxMaskModule.forRoot(),
    TranslateModule.forChild(),
  ],
})
export class AddSupplierModule {}
