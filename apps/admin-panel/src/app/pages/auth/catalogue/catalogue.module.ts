import { CatalogueImportResponsePopupComponent } from './import-response-popup/catalogue-import-response-popup.component';
import { LoadingPopupModule } from './../../../../../../dashboard/src/app/popups/loading-popup/loading-popup.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { CatalogueComponent } from './catalogue.component';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CatalogueImagesSyncPopupComponent } from './images-sync-popup/catalogue-images-sync-popup.component';
import { ViewCatalogueComponent } from './view/view-catalogue.component';

const routes: Routes = [
  {
    path: '',
    component: CatalogueComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/catalogue-detail.module').then(
        (m) => m.CatalogueDetailModule
      ),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/catalogue-detail.module').then(
        (m) => m.CatalogueDetailModule
      ),
  },
];

@NgModule({
  declarations: [
    CatalogueComponent,
    CatalogueImportResponsePopupComponent,
    CatalogueImagesSyncPopupComponent,
    ViewCatalogueComponent,
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
  ],
  entryComponents: [
    ViewCatalogueComponent,
    CatalogueImportResponsePopupComponent,
    CatalogueImagesSyncPopupComponent,
  ],
})
export class CatalogueModule {}
