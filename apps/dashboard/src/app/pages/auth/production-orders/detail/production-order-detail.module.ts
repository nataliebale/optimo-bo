import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { ProductionOrderDetailComponent } from './production-order-detail.component';
import { ProductionOrderDetailProductsComponent } from './products/production-order-detail-products.component';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { TableModule } from '@optimo/ui-table';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { TempalteValidationsModule } from '../../../../directives/tempalte-validations/template-validations.module';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    ProductionOrderDetailComponent,
    ProductionOrderDetailProductsComponent,
  ],
  entryComponents: [ProductionOrderDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    ApproveDialogModule,
    DynamicSelectModule,
    TableModule,
    MatIconModule,
    BottomSheetDispacherModule.forRoot(ProductionOrderDetailComponent),
    NgSelectModule,
    ClickOutsideModule,
    DatePickerModule,
    IconModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
    TempalteValidationsModule,
	TranslateModule.forChild()
  ],
})
export class ProductionOrderDetailModule {}
