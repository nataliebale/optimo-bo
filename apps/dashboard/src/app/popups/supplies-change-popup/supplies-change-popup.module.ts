import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliesChangePopupComponent } from './supplies-change-popup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  declarations: [SuppliesChangePopupComponent],
  entryComponents: [SuppliesChangePopupComponent],
  exports: [SuppliesChangePopupComponent],
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    DynamicSelectModule,
    ApproveDialogModule,
    NgSelectModule,
    IconModule
  ],
})
export class SuppliesChangePopupModule {}
