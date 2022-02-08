import { DetailPopupComponent } from './detail-popup/detail-popup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { GlovoProductsComponent } from './glovo-products.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';
import { ImportProductsResponsePopupComponent } from './import-products-response-popup/import-products-response-popup.component';
const routes: Routes = [
  {
    path: '',
    component: GlovoProductsComponent,
  },
];

@NgModule({
  declarations: [
    GlovoProductsComponent,
    DetailPopupComponent,
    ImportProductsResponsePopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    IconModule,
    TableModule,
    ApproveDialogModule,
    ReactiveFormsModule,
    NgSelectModule,
    MatTooltipModule,
    DynamicSelectModule,
    ClickOutsideModule,
    TranslateModule.forChild(),
  ],
  entryComponents: [],
})
export class GlovoProductsModule {}
