import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderComponent } from './file-uploader.component';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  imports: [CommonModule, IconModule],
  declarations: [FileUploaderComponent],
  exports: [FileUploaderComponent],
})
export class FileUploaderModule {}
