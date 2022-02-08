import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Directive({
  selector: '[appLessOrEqualThan]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: LessOrEqualThanDirective,
      multi: true,
    },
  ],
})
export class LessOrEqualThanDirective implements Validator {
  @Input() appLessOrEqualThan: number;
  validate(control: AbstractControl): ValidationErrors | null {
    return CustomValidators.LessOrEqualThan(this.appLessOrEqualThan)(control);
  }
}
