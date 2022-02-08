import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessTypeDetailComponent } from './business-type-detail.component';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [BusinessTypeDetailComponent],
  exports: [BusinessTypeDetailComponent],
  imports: [
    CommonModule,
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploaderModule,
    IconModule,
    MatDialogModule,
  ],
})
export class BusinessTypeDetailModule {}
