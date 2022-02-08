import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'order',
    loadChildren:
      () => import('src/app/pages/public/order/public-order.module').then(m => m.PublicOrderModule)
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)]
})
export class PublicModule {}
