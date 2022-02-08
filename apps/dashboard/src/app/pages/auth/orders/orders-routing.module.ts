import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdersComponent } from './orders.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./add-order/add-order.module').then((m) => m.AddOrderModule),
    data: {
      hotjarEventName: 'Add Purchase',
    }
  },
  {
    path: 'edit/:id/:mode',
    loadChildren: () =>
      import('./add-order/add-order.module').then((m) => m.AddOrderModule),
    data: {
      hotjarEventName: 'Edit Purchase',
    }
  },
  {
    path: 'receive/:id/:mode',
    loadChildren: () =>
      import('./add-order/add-order.module').then((m) => m.AddOrderModule),
    data: {
      hotjarEventName: 'Receive Purchase',
    }
  },
  {
    path: 'duplicate/:id/:mode',
    loadChildren: () =>
      import('./add-order/add-order.module').then((m) => m.AddOrderModule),
    data: {
      hotjarEventName: 'Duplicate Purchase',
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule {}
