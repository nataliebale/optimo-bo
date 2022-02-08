import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-password-edit-box',
  templateUrl: './password-edit-box.component.html',
  styleUrls: ['./password-edit-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordEditBoxComponent),
      multi: true
    }
  ]
})
export class PasswordEditBoxComponent implements ControlValueAccessor {
  @Input()
  placeholder = 'ჩაწერე';

  @Input('value')
  _value: any;

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  @Input()
  inputType: 'password' | 'text' = 'password';

  @Input()
  autocomplete = 'new-password';

  isDisabled: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  toggleInputType() {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
  }

  onChange = (val: any) => {};
  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }
}
