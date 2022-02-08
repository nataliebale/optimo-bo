import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconModule } from '@optimo/ui-icon';
import { NgxMaskModule } from 'ngx-mask';
import { ReceiptDetailComponent } from './receipt-detail.component';
import { SuppliesChangePopupModule } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.module';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
import { TempalteValidationsModule } from 'apps/dashboard/src/app/directives/tempalte-validations/template-validations.module';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ReceiptDetailComponent, IngredientsListComponent],
  entryComponents: [ReceiptDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    ApproveDialogModule,
    DynamicSelectModule,
    BottomSheetDispacherModule.forRoot(ReceiptDetailComponent),
    NgSelectModule,
    IconModule,
    TableModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    SuppliesChangePopupModule,
    TempalteValidationsModule,
    DatePickerModule,
	TranslateModule.forChild()
  ],
})
export class ReceiptDetailModule {}
