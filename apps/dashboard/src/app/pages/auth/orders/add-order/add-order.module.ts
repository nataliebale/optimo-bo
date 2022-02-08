import { AddOrderComponent } from './add-order.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { AddOrderLinesComponent } from './add-order-lines/add-order-lines.component';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { TempalteValidationsModule } from 'apps/dashboard/src/app/directives/tempalte-validations/template-validations.module';
import { TranslateModule } from '@ngx-translate/core';
import { OrderLinesExcelImportComponent } from './order-lines-excel-import/order-lines-excel-import.component';

@NgModule({
  declarations: [AddOrderComponent, AddOrderLinesComponent, OrderLinesExcelImportComponent],
  entryComponents: [AddOrderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FileUploaderModule,
    ApproveDialogModule,
    DynamicSelectModule,
    TableModule,
    MatIconModule,
    BottomSheetDispacherModule.forRoot(AddOrderComponent),
    NgSelectModule,
    ClickOutsideModule,
    DatePickerModule,
    IconModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    TempalteValidationsModule,
    TranslateModule.forChild(),
  ],
})
export class AddOrderModule {}
