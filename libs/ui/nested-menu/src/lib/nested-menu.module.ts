import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NestedMenuComponent } from './nested-menu.component';
import { IconModule } from '@optimo/ui-icon';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

export interface MenuItem {
  text: string;
  icon?: string;
  path?: string;
  alt?: string;
  children?: Array<MenuItem>;
  decisionField?: string;
  isVisibleForAllLocations?: boolean;
}

@NgModule({
  declarations: [NestedMenuComponent, MenuItemComponent],
  exports: [NestedMenuComponent],
  imports: [CommonModule, RouterModule, IconModule, MatTooltipModule, TranslateModule.forChild()],
})
export class NestedMenuModule {}
