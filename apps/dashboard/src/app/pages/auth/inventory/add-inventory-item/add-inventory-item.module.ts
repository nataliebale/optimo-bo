import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { AddCategoryModule } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category.module';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { AddInventoryItemComponent } from './add-inventory-item.component';
import { IconModule } from '@optimo/ui-icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { SuppliesChangePopupModule } from 'apps/dashboard/src/app/popups/supplies-change-popup/supplies-change-popup.module';
import { RouterModule } from '@angular/router';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddInventoryItemImeisComponent } from './imeis/add-inventory-item-imeis.component';
import { TableModule } from '@optimo/ui-table';
import { CdkTableModule } from '@angular/cdk/table';
import { AddInventoryItemImeiAddPopupComponent } from './imeis/add-popup/add-inventory-item-imei-add-popup.component';
import { AddInventoryItemLotsComponent } from './lots/add-inventory-item-lots.component';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddInventoryItemComponent,
    AddInventoryItemImeisComponent,
    AddInventoryItemLotsComponent,
    AddInventoryItemImeiAddPopupComponent,
  ],
  entryComponents: [
    AddInventoryItemComponent,
    AddInventoryItemImeiAddPopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatBottomSheetModule,
    FileUploaderModule,
    DynamicSelectModule,
    AddCategoryModule,
    ApproveDialogModule,
    NgxMaskModule.forRoot(),
    SuppliesChangePopupModule,
    IconModule,
    NgSelectModule,
    DatePickerModule,
    ClickOutsideModule,
    MatTooltipModule,
    BottomSheetDispacherModule.forRoot(AddInventoryItemComponent),
    TableModule,
    CdkTableModule,
    TranslateModule.forChild()
  ],
})
export class AddInventoryItemModule {}
