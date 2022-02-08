import { Directive, Input } from '@angular/core';
import {
  NG_VALIDATORS,
  AbstractControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Directive({
  selector: '[appMoreThan]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: MoreThanDirective, multi: true },
  ],
})
export class MoreThanDirective implements Validator {
  @Input() appMoreThan: number;
  validate(control: AbstractControl): ValidationErrors | null {
    return CustomValidators.MoreThan(this.appMoreThan)(control);
  }
}
