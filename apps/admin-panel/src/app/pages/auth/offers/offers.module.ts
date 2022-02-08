import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from '../offers/offers.component';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';

const routes: Routes = [
  {
    path: '',
    component: OffersComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/offer-detail.module').then((m) => m.OfferDetailModule),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/offer-detail.module').then((m) => m.OfferDetailModule),
  },
];

@NgModule({
  declarations: [OffersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    IconModule,
  ],
})
export class OffersModule {}
