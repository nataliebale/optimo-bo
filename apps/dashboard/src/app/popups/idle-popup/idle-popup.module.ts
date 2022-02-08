import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IdlePopupComponent } from './idle-popup.component';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  declarations: [IdlePopupComponent],
  entryComponents: [IdlePopupComponent],
  exports: [IdlePopupComponent],
  imports: [CommonModule, MatButtonModule, MatDialogModule, IconModule]
})
export class IdlePopupModule {}
