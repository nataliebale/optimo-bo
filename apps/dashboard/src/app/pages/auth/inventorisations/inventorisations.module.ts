import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { IconModule } from '@optimo/ui-icon';
import { Routes, RouterModule } from '@angular/router';
import { ViewInventorisationComponent } from './view/view-inventorisation.component';
import { InventorisationsComponent } from './inventorisations.component';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { MessagePopupModule } from '../../../popups/message-popup/message-popup.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { InventorisationMismatchesComponent } from './mismatches/inventorisation-mismatches.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { TempalteValidationsModule } from '../../../directives/tempalte-validations/template-validations.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
 

const routes: Routes = [
  {
    path: '',
    component: InventorisationsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/inventorisation-detail.module').then(
        (m) => m.InventorisationDetailModule
      ),
    data: {
      'hotjarEventName': 'Add Stock Takes',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/inventorisation-detail.module').then(
        (m) => m.InventorisationDetailModule
      ),
    data: {
      'hotjarEventName': 'Edit Stock Takes',
    }
  },
];
@NgModule({
  declarations: [
    InventorisationsComponent,
    ViewInventorisationComponent,
    InventorisationMismatchesComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ApproveDialogModule,
    MatTooltipModule,
    IconModule,
    FormsModule,
    LoadingPopupModule,
    ClickOutsideModule,
    MessagePopupModule,
    NgxMaskModule.forRoot(),
    MatBottomSheetModule,
    TempalteValidationsModule,
    NgSelectModule,
	UiViewAttributesModule,
	 
	TranslateModule.forChild()
  ],
  entryComponents: [
    ViewInventorisationComponent,
    InventorisationMismatchesComponent,
  ],
})
export class InventorisationsModule {}
