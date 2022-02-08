import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddSupplierProductsComponent } from './add-supplier-products.component';


const routes: Routes = [
  {
    path: '',
    component: AddSupplierProductsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddSupplierProductsRoutingModule { }
