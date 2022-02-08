import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { ViewOrderComponent } from './view-order/view-order.component';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ClickOutsideModule } from '@optimo/util-click-outside';
 

@NgModule({
  declarations: [OrdersComponent, ViewOrderComponent],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    TableModule,
    ApproveDialogModule,
    MatTooltipModule,
    IconModule,
	  UiViewAttributesModule,
    TranslateModule.forChild(),
    InfiniteScrollModule,
    ClickOutsideModule,
  ],
  entryComponents: [ViewOrderComponent],
})
export class OrdersModule {}
