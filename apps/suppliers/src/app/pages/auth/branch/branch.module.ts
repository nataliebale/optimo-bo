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
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { BranchComponent } from './branch.component';

const routes: Routes = [
  {
    path: '',
    component: BranchComponent,
  },
];

@NgModule({
  declarations: [BranchComponent],
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
    ClickOutsideModule,
  ],
})
export class BranchModule {}
