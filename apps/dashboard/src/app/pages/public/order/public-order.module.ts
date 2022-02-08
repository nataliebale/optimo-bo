import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicOrderComponent } from './public-order.component';
import { TableModule } from '@optimo/ui-table';
import { MatButtonModule } from '@angular/material/button';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: ':guid/:uid',
    component: PublicOrderComponent,
  },
];

@NgModule({
  declarations: [PublicOrderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatButtonModule,
  ],
})
export class PublicOrderModule {}
