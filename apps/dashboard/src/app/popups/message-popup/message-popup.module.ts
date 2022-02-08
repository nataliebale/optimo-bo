import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MessagePopupComponent } from './message-popup.component';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  declarations: [MessagePopupComponent],
  entryComponents: [MessagePopupComponent],
  exports: [MessagePopupComponent],
  imports: [CommonModule, MatDialogModule, IconModule]
})
export class MessagePopupModule {}
