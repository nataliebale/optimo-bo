import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { LoadingPopupComponent } from './loading-popup.component';

@NgModule({
  declarations: [LoadingPopupComponent],
  entryComponents: [LoadingPopupComponent],
  exports: [LoadingPopupComponent],
  imports: [CommonModule, MatDialogModule, IconModule],
})
export class LoadingPopupModule {}
