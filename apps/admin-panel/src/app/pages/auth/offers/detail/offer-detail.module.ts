import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferDetailComponent } from './offer-detail.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '@optimo/ui-icon';
import { QuillModule } from 'ngx-quill';
import { ClipboardModule } from '@angular/cdk/clipboard';

@NgModule({
  declarations: [OfferDetailComponent],
  imports: [
    CommonModule,
    BottomSheetDispacherModule.forRoot(OfferDetailComponent),
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    QuillModule.forRoot(),
    ClipboardModule,
  ],
})
export class OfferDetailModule {}
