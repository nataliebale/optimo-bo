import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogueDetailComponent } from './catalogue-detail.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '@optimo/ui-icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';

@NgModule({
  declarations: [CatalogueDetailComponent],
  imports: [
    CommonModule,
    BottomSheetDispacherModule.forRoot(CatalogueDetailComponent),
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgSelectModule,
    DynamicSelectModule,
  ],
})
export class CatalogueDetailModule {}
