import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { RouterModule, Routes } from '@angular/router';
import { EntitySalesComponent } from './entity-sales.component';
import { ViewEntitySaleComponent } from './view/view-entity-sale.component';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
 

const routes: Routes = [
  {
    path: '',
    component: EntitySalesComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/entity-sales-detail.module').then(
        (m) => m.EntitySalesDetailModule
      ),
    data: {
      hotjarEventName: 'Add B2B Sale',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/entity-sales-detail.module').then(
        (m) => m.EntitySalesDetailModule
      ),
    data: {
      hotjarEventName: 'Edit B2B Sale',
    }
  },
];

@NgModule({
  declarations: [EntitySalesComponent, ViewEntitySaleComponent],
  entryComponents: [ViewEntitySaleComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ApproveDialogModule,
    MatTooltipModule,
    IconModule,
	UiViewAttributesModule,
	 
  ],
})
export class EntitySalesModule {}
