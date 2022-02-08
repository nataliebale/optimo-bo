import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ViewCategoryComponent } from './view-category.component';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
 

@NgModule({
  declarations: [ViewCategoryComponent],
  entryComponents: [ViewCategoryComponent],
  exports: [ViewCategoryComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TableModule,
    IconModule,
    MatTooltipModule,
	UiViewAttributesModule,
	 
	TranslateModule.forChild()
  ],
})
export class ViewCategoryModule {}
