import { NgModule } from '@angular/core';
import { MoreThanDirective } from './more-than.directive';
import { LessOrEqualThanDirective } from './less-or-equal-than.directive';
import { MoreOrEqualThanDirective } from './more-or-equal-than.directive';

@NgModule({
  declarations: [
    MoreThanDirective,
    MoreOrEqualThanDirective,
    LessOrEqualThanDirective
  ],
  exports: [
    MoreThanDirective,
    MoreOrEqualThanDirective,
    LessOrEqualThanDirective
  ]
})
export class TempalteValidationsModule {}
