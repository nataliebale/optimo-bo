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
import { ReceiptTemplateDetailComponent } from './receipt-template-detail.component';
import { SuppliesChangePopupModule } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.module';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ReceiptTemplateDetailComponent, IngredientsListComponent],
  entryComponents: [ReceiptTemplateDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    ApproveDialogModule,
    DynamicSelectModule,
    BottomSheetDispacherModule.forRoot(ReceiptTemplateDetailComponent),
    NgSelectModule,
    IconModule,
    TableModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    SuppliesChangePopupModule,
	TranslateModule.forChild()
  ],
})
export class ReceiptTemplateDetailModule {}
