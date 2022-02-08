import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory.component';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { ViewInventoryItemComponent } from './view-inventory-item/view-inventory-item.component';
import { ViewCategoryModule } from '../categories/view-category/view-category.module';
import { ViewSupplierModule } from '../suppliers/view-supplier/view-supplier.module';
import { InventoryImportResponsePopupComponent } from './import-response-popup/inventory-import-response-popup.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { PrintBarcodeModule } from '@optimo/ui-print-barcode';
import { InventoryPricesSyncPopupComponent } from './prices-sync-popup/inventory-prices-sync-popup.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { InventoryRsImportPopupComponent } from './rs-import-popup/inventory-rs-import-popup.component';

import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    InventoryComponent,
    ViewInventoryItemComponent,
    InventoryImportResponsePopupComponent,
    InventoryPricesSyncPopupComponent,
    InventoryRsImportPopupComponent,
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    TableModule,
    FormsModule,
    MatDialogModule,
    ApproveDialogModule,
    IconModule,
    MatTooltipModule,
    ViewCategoryModule,
    ViewSupplierModule,
    ClickOutsideModule,
    LoadingPopupModule,
    PrintBarcodeModule,

    NgSelectModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [
    ViewInventoryItemComponent,
    InventoryImportResponsePopupComponent,
    InventoryPricesSyncPopupComponent,
    InventoryRsImportPopupComponent,
  ],
})
export class InventoryModule {}
