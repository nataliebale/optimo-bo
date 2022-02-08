import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from '@optimo/ui-table';
import { ViewSupplierComponent } from './view-supplier.component';
import { IconModule } from '@optimo/ui-icon';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiViewAttributesModule } from '@optimo/ui/view-attributes';
import { TranslateModule } from '@ngx-translate/core';
 

@NgModule({
  declarations: [ViewSupplierComponent],
  entryComponents: [ViewSupplierComponent],
  exports: [ViewSupplierComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    TableModule,
    IconModule,
    MatTooltipModule,
	UiViewAttributesModule,
	 
    TranslateModule.forChild(),
  ],
})
export class ViewSupplierModule {}
