import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAttributeComponent } from './add-attribute.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';

@NgModule({
  declarations: [AddAttributeComponent],
  exports: [AddAttributeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    ApproveDialogModule,
    IconModule,
    FileUploaderModule,
    MatTooltipModule,
    DynamicSelectModule,
  ],
})
export class AddAttributeModule {}
