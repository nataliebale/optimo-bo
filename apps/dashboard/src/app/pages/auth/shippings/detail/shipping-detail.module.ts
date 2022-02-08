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
import { TempalteValidationsModule } from '../../../../directives/tempalte-validations/template-validations.module';
import { ShippingDetailComponent } from './shipping-detail.component';
import { ShippingDetailProductsComponent } from './products/shipping-detail-products.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrderLinesExcelImportComponent } from './order-lines-excel-import/order-lines-excel-import.component';

@NgModule({
  declarations: [ShippingDetailComponent, ShippingDetailProductsComponent, OrderLinesExcelImportComponent],
  entryComponents: [ShippingDetailComponent],
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
    BottomSheetDispacherModule.forRoot(ShippingDetailComponent),
    NgSelectModule,
    ClickOutsideModule,
    DatePickerModule,
    IconModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    TempalteValidationsModule,
    TranslateModule.forChild(),
    IconModule,
  ],
})
export class ShippingDetailModule {}
