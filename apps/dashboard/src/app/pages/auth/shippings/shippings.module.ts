import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { Routes, RouterModule } from '@angular/router';
import { ShippingsComponent } from './shippings.component';
import { ViewShippingComponent } from './view/view-shipping.component';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
 

const routes: Routes = [
  {
    path: '',
    component: ShippingsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/shipping-detail.module').then(
        (m) => m.ShippingDetailModule
      ),
    data: {
      'hotjarEventName': 'Add Stock Transfers',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/shipping-detail.module').then(
        (m) => m.ShippingDetailModule
      ),
    data: {
      'hotjarEventName': 'Edit Stock Transfers',
    }
  },
];
@NgModule({
  declarations: [ShippingsComponent, ViewShippingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ApproveDialogModule,
    MatTooltipModule,
    IconModule,
    UiViewAttributesModule,
    TranslateModule.forChild(),
    InfiniteScrollModule,
  ],
  entryComponents: [ViewShippingComponent],
})
export class ShippingsModule {}
