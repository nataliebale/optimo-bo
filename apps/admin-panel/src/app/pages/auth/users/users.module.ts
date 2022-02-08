import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { UsersComponent } from './users.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { UserDetailModule } from './detail/user-detail.module';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
  },
  // {
  //   path: 'add',
  //   loadChildren: () =>
  //     import('./detail/user-detail.module').then((m) => m.UserDetailModule),
  // },
  // {
  //   path: 'edit/:id',
  //   loadChildren: () =>
  //     import('./detail/user-detail.module').then((m) => m.UserDetailModule),
  // },
];

@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    MatTooltipModule,
    IconModule,
    ApproveDialogModule,
    LoadingPopupModule,
    DynamicSelectModule,
    MatDialogModule,
    UserDetailModule,
  ],
})
export class UsersModule {}
