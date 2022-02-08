import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpaceDetailsDialogComponent } from './space-details-dialog.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SpaceDetailsDialogComponent],
  entryComponents: [SpaceDetailsDialogComponent],
  exports: [SpaceDetailsDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    DynamicSelectModule,
    ApproveDialogModule,
    IconModule,
    MatTooltipModule,
    TranslateModule.forChild(),
  ],
})
export class SpaceDetailsModule {}
