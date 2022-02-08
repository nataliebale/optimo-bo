import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryComponent } from './inventory.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./add-inventory-item/add-inventory-item.module').then(
        (m) => m.AddInventoryItemModule
      ),
    data: {
      'hotjarEventName': 'Add Product',
    },
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./add-inventory-item/add-inventory-item.module').then(
        (m) => m.AddInventoryItemModule
      ),
    data: {
      'hotjarEventName': 'Edit Product',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
