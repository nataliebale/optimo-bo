import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributesComponent } from './attributes.component';
import { RouterModule, Routes } from '@angular/router';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconModule } from '@optimo/ui-icon';
import { AddAttributeModule } from './add/add-attribute.module'
import { AddValuesModule } from './add-values/add-values.module';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';

const routes: Routes = [
  {
    path: '',
    component: AttributesComponent,
  },
  // {
  //   path: 'add',
  //   loadChildren: () =>
  //     import('./detail/offer-detail.module').then((m) => m.OfferDetailModule),
  // },
  // {
  //   path: 'edit/:id',
  //   loadChildren: () =>
  //     import('./detail/offer-detail.module').then((m) => m.OfferDetailModule),
  // },
];

@NgModule({
  declarations: [AttributesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    IconModule,
    AddAttributeModule,
    AddValuesModule,
    ApproveDialogModule,
  ]
})
export class AttributesModule { }
