import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { BusinessTypesComponent } from './business-types.component';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { BusinessTypeDetailModule } from './detail/business-type-detail.module';

const routes: Routes = [
  {
    path: '',
    component: BusinessTypesComponent,
  },
  // {
  //   path: 'add',
  //   loadChildren: () =>
  //     import('./detail/business-type-detail.module').then(
  //       (m) => m.BusinessTypeDetailModule
  //     ),
  // },
  // {
  //   path: 'edit/:id',
  //   loadChildren: () =>
  //     import('./detail/business-type-detail.module').then(
  //       (m) => m.BusinessTypeDetailModule
  //     ),
  // },
];

@NgModule({
  declarations: [BusinessTypesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    IconModule,
    ApproveDialogModule,
    MatDialogModule,
    ReactiveFormsModule,
    BusinessTypeDetailModule,
  ],
})
export class BusinessTypesModule {}
