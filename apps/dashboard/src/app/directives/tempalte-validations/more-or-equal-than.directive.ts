import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Directive({
  selector: '[appMoreOrEqualThan]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MoreOrEqualThanDirective,
      multi: true,
    },
  ],
})
export class MoreOrEqualThanDirective implements Validator {
  @Input() appMoreOrEqualThan: number;
  validate(control: AbstractControl): ValidationErrors | null {
    return CustomValidators.MoreOrEqualThan(this.appMoreOrEqualThan)(control);
  }
}
