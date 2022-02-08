import { ClickOutsideDirective } from './click-outside.directive';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ClickOutsideDirective],
  exports: [ClickOutsideDirective]
})
export class ClickOutsideModule {}
