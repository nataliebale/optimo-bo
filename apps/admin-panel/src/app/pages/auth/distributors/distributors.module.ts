import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { DistributorsComponent } from './distributors.component';
import { ViewDistributorComponent } from './view/view-distributor.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { DistributorFormImportResponsePopupComponent } from './form-import-response-popup/distributor-form-import-response-popup.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';

const routes: Routes = [
  {
    path: '',
    component: DistributorsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/distributor-detail.module').then(
        (m) => m.DistributorDetailModule
      ),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/distributor-detail.module').then(
        (m) => m.DistributorDetailModule
      ),
  },
];

@NgModule({
  declarations: [
    DistributorsComponent,
    ViewDistributorComponent,
    DistributorFormImportResponsePopupComponent,
  ],
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
    ClickOutsideModule
  ],
  entryComponents: [
    ViewDistributorComponent,
    DistributorFormImportResponsePopupComponent,
  ],
})
export class DistributorsModule {}
