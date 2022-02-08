import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagePopupComponent } from './package-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { SliderModule } from '@optimo/ui-slider';

@NgModule({
  declarations: [PackagePopupComponent],
  entryComponents: [PackagePopupComponent],
  exports: [PackagePopupComponent],
  imports: [CommonModule, MatDialogModule, IconModule, SliderModule],
})
export class PackagePopupModule {}
