import { ViewReceiptTemplateComponent } from './view-receipt-template/view-receipt-template.component';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { ReceiptTemplatesComponent } from './receipt-templates.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  {
    path: '',
    component: ReceiptTemplatesComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/receipt-template-detail.module').then(
        (m) => m.ReceiptTemplateDetailModule
      ),
    data: {
      hotjarEventName: 'Add Recipe Template',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/receipt-template-detail.module').then(
        (m) => m.ReceiptTemplateDetailModule
      ),
    data: {
      hotjarEventName: 'Edit Recipe Template',
    }
  },
];

@NgModule({
  declarations: [ReceiptTemplatesComponent, ViewReceiptTemplateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    ApproveDialogModule,
    IconModule,
    MatTooltipModule,
    UiViewAttributesModule,
	TranslateModule.forChild()
  ],
  entryComponents: [ViewReceiptTemplateComponent],
})
export class ReceiptTemplatesModule {}
