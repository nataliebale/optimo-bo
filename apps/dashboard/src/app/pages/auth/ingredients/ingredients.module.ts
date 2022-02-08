import { ReactiveFormsModule } from '@angular/forms';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { ViewIngredientComponent } from './view-ingredient/view-ingredient.component';
import { ApproveDialogModule } from '@optimo/ui-popups-approve-dialog';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Routes, RouterModule } from '@angular/router';
import { IconModule } from '@optimo/ui-icon';
import { IngredientsComponent } from './ingredients.component';
import { IngredientsMigrationComponent } from './migration/ingredients-migration.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImportIngredientsResponsePopupComponent } from './import-ingredients-response-popup/import-ingredients-response-popup.component';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  {
    path: '',
    component: IngredientsComponent,
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./detail/ingredient-detail.module').then(
        (m) => m.IngredientDetailModule
      ),
    data: {
      hotjarEventName: 'Add Ingredient',
    }
  },
  {
    path: 'edit/:id',
    loadChildren: () =>
      import('./detail/ingredient-detail.module').then(
        (m) => m.IngredientDetailModule
      ),
    data: {
      hotjarEventName: 'Edit Ingredient',
    }
  },
];

@NgModule({
  declarations: [
    IngredientsComponent,
    ViewIngredientComponent,
    IngredientsMigrationComponent,
    ImportIngredientsResponsePopupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatDialogModule,
    TableModule,
    ApproveDialogModule,
    IconModule,
    DynamicSelectModule,
    ReactiveFormsModule,
    NgSelectModule,
    ClickOutsideModule,
    MatTooltipModule,
	TranslateModule.forChild()
  ],
  entryComponents: [ViewIngredientComponent, IngredientsMigrationComponent],
})
export class IngredientsModule {}
