import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { RouterModule, Routes } from '@angular/router';
import { EntityClientsComponent } from './entity-clients.component';
import { ClientsImportPopupComponent } from './clients-import/clients-import-popup.component';
import { EntityClientTransactionPopupComponent } from './transaction-popup/entity-client-transaction-popup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: EntityClientsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/entity-clients-detail.module').then(
        (m) => m.EntityClientsDetailModule
      ),
    data: {
      hotjarEventName: 'Add B2B Client',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/entity-clients-detail.module').then(
        (m) => m.EntityClientsDetailModule
      ),
    data: {
      hotjarEventName: 'Edit B2B Client',
    }
  },
];

@NgModule({
  declarations: [
    EntityClientsComponent,
    ClientsImportPopupComponent,
    EntityClientTransactionPopupComponent,
  ],
  entryComponents: [
    ClientsImportPopupComponent,
    EntityClientTransactionPopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ApproveDialogModule,
    MatTooltipModule,
    IconModule,
    ReactiveFormsModule,
	NgSelectModule,
	 
    TranslateModule.forChild(),
  ],
})
export class EntityClientsModule {}
