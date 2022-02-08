import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FAQDetailComponent } from './faq-detail.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  declarations: [FAQDetailComponent],
  imports: [
    CommonModule,
    BottomSheetDispacherModule.forRoot(FAQDetailComponent),
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgSelectModule,
    DynamicSelectModule,
  ],
})
export class FAQDetailModule {}
