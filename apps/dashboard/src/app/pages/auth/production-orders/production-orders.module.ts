import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { Routes, RouterModule } from '@angular/router';
import { ProductionOrdersComponent } from './production-orders.component';
import { ViewProductionOrderComponent } from './view/view-production-order.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ProductionOrdersComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/production-order-detail.module').then(
        (m) => m.ProductionOrderDetailModule
      ),
    data: {
      hotjarEventName: 'Add Preparation',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/production-order-detail.module').then(
        (m) => m.ProductionOrderDetailModule
      ),
    data: {
      hotjarEventName: 'Edit Preparation',
    }
  },
];

@NgModule({
  declarations: [ProductionOrdersComponent, ViewProductionOrderComponent],
  entryComponents: [ViewProductionOrderComponent],
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
})
export class ProductionOrdersModule {}
