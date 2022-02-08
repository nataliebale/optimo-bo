import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';

import { NgxMaskModule } from 'ngx-mask';
import { IngredientDetailComponent } from './ingredient-detail.component';
import { SuppliesChangePopupModule } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [IngredientDetailComponent],
  entryComponents: [IngredientDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    ApproveDialogModule,
    DynamicSelectModule,
    BottomSheetDispacherModule.forRoot(IngredientDetailComponent),
    NgSelectModule,
    IconModule,
    NgxMaskModule.forRoot(),
    SuppliesChangePopupModule,
	TranslateModule.forChild()
  ],
})
export class IngredientDetailModule {}
