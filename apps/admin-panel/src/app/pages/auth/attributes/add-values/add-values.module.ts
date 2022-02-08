import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddValuesComponent } from './add-values.component';
import { TableModule } from '@optimo/ui-table';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';

@NgModule({
  declarations: [AddValuesComponent],
  exports: [AddValuesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    IconModule,
    MatTooltipModule,
    TableModule,
    ClickOutsideModule,
    ApproveDialogModule,
  ],
})
export class AddValuesModule { }
