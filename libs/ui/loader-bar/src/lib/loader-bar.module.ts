import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderBarComponent } from './loader-bar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LoaderBarComponent],
  exports: [LoaderBarComponent],
})
export class LoaderBarModule {}
