import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuppliersComponent } from './suppliers.component';

const routes: Routes = [
  {
    path: '',
    component: SuppliersComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./add-supplier/add-supplier.module').then(
        (m) => m.AddSupplierModule
      ),
    data: {
      hotjarEventName: 'Add Supplier',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./add-supplier/add-supplier.module').then(
        (m) => m.AddSupplierModule
      ),
    data: {
      hotjarEventName: 'Edit Supplier',
    }
  },
  // {
  //   path: 'add-products/:id',
  //   loadChildren: () =>
  //     import(
  //       './add-supplier-products/add-supplier-products.module'
  //     ).then(m => m.AddSupplierProductsModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuppliersRoutingModule {}
