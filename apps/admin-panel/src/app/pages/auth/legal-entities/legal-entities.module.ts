import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { LegalEntitiesComponent } from './legal-entities.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';

const routes: Routes = [
  {
    path: '',
    component: LegalEntitiesComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/legal-entity-detail.module').then(
        (m) => m.LegalEntityDetailModule
      ),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/legal-entity-detail.module').then(
        (m) => m.LegalEntityDetailModule
      ),
  },
  {
    path: 'create/:requestId',
    loadChildren: () =>
      import('./detail/legal-entity-detail.module').then(
        (m) => m.LegalEntityDetailModule
      ),
  },
];

@NgModule({
  declarations: [LegalEntitiesComponent],
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
  ],
})
export class LegalEntitiesModule {}
