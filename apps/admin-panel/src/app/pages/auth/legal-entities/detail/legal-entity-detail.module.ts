import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LegalEntityDetailComponent } from './legal-entity-detail.component';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { IconModule } from '@optimo/ui-icon';
import { MatDialogModule } from '@angular/material/dialog';
import { UserDetailModule } from '../../users/detail/user-detail.module';

@NgModule({
  declarations: [LegalEntityDetailComponent],
  imports: [
    CommonModule,
    BottomSheetDispacherModule.forRoot(LegalEntityDetailComponent),
    FileUploaderModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    NgSelectModule,
    DynamicSelectModule,
    MatDialogModule,
    UserDetailModule,
  ],
})
export class LegalEntityDetailModule {}
