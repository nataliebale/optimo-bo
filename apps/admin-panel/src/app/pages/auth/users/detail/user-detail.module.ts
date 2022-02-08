import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserDetailComponent } from './user-detail.component';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [UserDetailComponent],
  imports: [
    CommonModule,
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgSelectModule,
    DynamicSelectModule,
    MatDialogModule,
  ],
})
export class UserDetailModule {}
