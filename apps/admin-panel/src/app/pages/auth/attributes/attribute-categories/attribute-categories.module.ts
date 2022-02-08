import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AttributeCategoriesComponent } from './attribute-categories.component';
import { TableModule } from '@optimo/ui-table';
import { AddAttributeCategoryModule } from './add-attribute-category/add-attribute-category.module';
import { IconModule } from '@optimo/ui-icon';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';


const routes: Routes = [
  { path: '', component: AttributeCategoriesComponent }
];

@NgModule({
  declarations: [AttributeCategoriesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    AddAttributeCategoryModule,
    IconModule,
    ApproveDialogModule,
  ]
})
export class AttributeCategoriesModule { }
