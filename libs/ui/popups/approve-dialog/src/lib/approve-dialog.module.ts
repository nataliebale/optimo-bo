import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ApproveDialogComponent } from './approve-dialog.component';
import { IconModule } from '@optimo/ui-icon';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ApproveDialogComponent],
  entryComponents: [ApproveDialogComponent],
  exports: [ApproveDialogComponent],
  imports: [CommonModule, MatDialogModule, IconModule, TranslateModule.forChild()],
})
export class ApproveDialogModule {}
