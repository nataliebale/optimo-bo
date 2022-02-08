import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './categories.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { AddCategoryModule } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category.module';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { ViewCategoryModule } from './view-category/view-category.module';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
];

@NgModule({
  declarations: [CategoriesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    ApproveDialogModule,
    AddCategoryModule,
    IconModule,
    ViewCategoryModule,
    MatTooltipModule,
    TranslateModule.forChild(),
  ],
})
export class CategoriesModule {}
