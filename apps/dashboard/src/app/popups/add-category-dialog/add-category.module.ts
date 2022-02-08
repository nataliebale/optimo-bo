import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddCategoryDialogComponent } from './add-category-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AddCategoryDialogComponent],
  entryComponents: [AddCategoryDialogComponent],
  exports: [AddCategoryDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    ApproveDialogModule,
    IconModule,
    FileUploaderModule,
	MatTooltipModule,
	TranslateModule.forChild()
  ],
})
export class AddCategoryModule {}
