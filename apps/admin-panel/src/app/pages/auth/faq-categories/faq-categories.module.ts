import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { FAQCategoriesComponent } from './faq-categories.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { LoadingPopupModule } from '../../../popups/loading-popup/loading-popup.module';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';

const routes: Routes = [
  {
    path: '',
    component: FAQCategoriesComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/faq-category-detail.module').then(
        (m) => m.FAQCategoryDetailModule
      ),
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/faq-category-detail.module').then(
        (m) => m.FAQCategoryDetailModule
      ),
  },
];

@NgModule({
  declarations: [FAQCategoriesComponent],
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
export class FAQCategoriesModule {}
