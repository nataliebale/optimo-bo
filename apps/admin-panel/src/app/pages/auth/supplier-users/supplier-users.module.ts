import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { SupplierUserDetailModule } from './detail/supplier-user-detail.module';
import { SupplierUsersComponent } from './supplier-users.component';

const routes: Routes = [
  {
    path: '',
    component: SupplierUsersComponent,
  },
];

@NgModule({
  declarations: [SupplierUsersComponent],
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
    SupplierUserDetailModule,
  ],
})
export class SupplierUsersModule {}
