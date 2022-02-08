import { ViewReceiptComponent } from './view-receipt/view-receipt.component';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { ReceiptsComponent } from './receipts.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { ImportReceiptsResponsePopupComponent } from './import-receipts-response-popup/import-receipts-response-popup.component';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  {
    path: '',
    component: ReceiptsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/receipt-detail.module').then(
        (m) => m.ReceiptDetailModule
      ),
    data: {
      hotjarEventName: 'Add Recipe',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/receipt-detail.module').then(
        (m) => m.ReceiptDetailModule
      ),
    data: {
      hotjarEventName: 'Add Recipe',
    }
  },
];

@NgModule({
  declarations: [
    ReceiptsComponent,
    ViewReceiptComponent,
    ImportReceiptsResponsePopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    ApproveDialogModule,
    ClickOutsideModule,
    IconModule,
    MatTooltipModule,
    UiViewAttributesModule,
	TranslateModule.forChild()
  ],
  entryComponents: [ViewReceiptComponent],
})
export class ReceiptsModule {}
