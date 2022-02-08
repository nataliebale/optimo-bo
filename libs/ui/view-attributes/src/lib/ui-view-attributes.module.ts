import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewAttributesComponent } from './view-attributes.component';
import { AttributeItemComponent } from './attribute-item/attribute-item.component';
import {IconModule} from '@optimo/ui-icon';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    IconModule,
    ClickOutsideModule,
    TranslateModule.forChild()
  ],
  declarations: [ViewAttributesComponent, AttributeItemComponent],
  exports: [
    ViewAttributesComponent,
  ]
})
export class UiViewAttributesModule {}
