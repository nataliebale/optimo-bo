import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { TableModule } from '@optimo/ui-table';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { TempalteValidationsModule } from 'apps/dashboard/src/app/directives/tempalte-validations/template-validations.module';
import { Routes, RouterModule } from '@angular/router';
import { PricesChangeListComponent } from './list/prices-change-list.component';
import { PricesChangeComponent } from './prices-change.component';
 

const routes: Routes = [
  {
    path: '',
    component: PricesChangeComponent,
  },
];

@NgModule({
  declarations: [PricesChangeComponent, PricesChangeListComponent],
  entryComponents: [PricesChangeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    ApproveDialogModule,
    DynamicSelectModule,
    TableModule,
    MatIconModule,
    BottomSheetDispacherModule.forRoot(PricesChangeComponent),
    NgSelectModule,
    ClickOutsideModule,
    DatePickerModule,
    IconModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
	TempalteValidationsModule,
	 
  ],
})
export class PricesChangeModule {}
