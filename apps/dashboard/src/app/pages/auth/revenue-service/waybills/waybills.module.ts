import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaybillsComponent } from './waybills.component';
import { TableModule } from '@optimo/ui-table';
import { Routes, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { LoadingPopupModule } from 'apps/dashboard/src/app/popups/loading-popup/loading-popup.module';
import { IssuedWaybillsComponent } from './issued/issued-waybills.component';
import { ReceivedWaybillsComponent } from './received/received-waybills.component';
import { ViewReceivedWaybillComponent } from './received/view/view-received-waybill.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', redirectTo: 'received' },
  {
    path: '',
    component: WaybillsComponent,
    children: [
      {
        path: 'received',
        component: ReceivedWaybillsComponent,
      },
      {
        path: 'issued',
        component: IssuedWaybillsComponent,
      },
    ],
  },
  {
    path: 'received/edit/:id',
    loadChildren: () =>
      import('./received/edit/received-waybill-edit.module').then(
        (m) => m.ReceivedWaybillEditModule
      ),
  },
  { path: '**', redirectTo: 'received' },
];

@NgModule({
  declarations: [
    WaybillsComponent,
    IssuedWaybillsComponent,
    ReceivedWaybillsComponent,
    ViewReceivedWaybillComponent,
  ],
  entryComponents: [ViewReceivedWaybillComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatDialogModule,
    IconModule,
    LoadingPopupModule,
    MatTooltipModule,
    UiViewAttributesModule,
    NgSelectModule,
    FormsModule,
    TranslateModule.forChild(),
  ],
})
export class WaybillsModule {}
