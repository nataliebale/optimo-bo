import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
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
import { EntitySalesDetailProductsComponent } from './products/entity-sales-detail-products.component';
import { EntitySalesDetailComponent } from './entity-sales-detail.component';
import { TempalteValidationsModule } from 'apps/dashboard/src/app/directives/tempalte-validations/template-validations.module';
 
@NgModule({
  declarations: [
    EntitySalesDetailComponent,
    EntitySalesDetailProductsComponent,
  ],
  entryComponents: [EntitySalesDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    ApproveDialogModule,
    DynamicSelectModule,
    TableModule,
    MatIconModule,
    BottomSheetDispacherModule.forRoot(EntitySalesDetailComponent),
    NgSelectModule,
    ClickOutsideModule,
    DatePickerModule,
    IconModule,
    MatTooltipModule,
    NgxMaskModule.forRoot(),
	TempalteValidationsModule,
	 
  ],
})
export class EntitySalesDetailModule {}
