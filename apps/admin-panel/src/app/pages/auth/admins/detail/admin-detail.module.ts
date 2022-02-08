import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AdminDetailComponent } from './admin-detail.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  declarations: [AdminDetailComponent],
  imports: [
    CommonModule,
    BottomSheetDispacherModule.forRoot(AdminDetailComponent),
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgSelectModule,
    DynamicSelectModule,
  ],
})
export class AdminDetailModule {}
