import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  forwardRef,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-profile-edit-box',
  templateUrl: './profile-edit-box.component.html',
  styleUrls: ['./profile-edit-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfileEditBoxComponent),
      multi: true
    }
  ]
})
export class ProfileEditBoxComponent implements ControlValueAccessor {
  @Input()
  type = 'text';

  @Input()
  placeholder = 'ჩაწერე';

  @Input('value')
  _value: any;

  @Input()
  inputMask: string;

  @Output()
  save = new EventEmitter<void>();

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  isDisabled: boolean;
  defaultValue: any;

  constructor(private cdr: ChangeDetectorRef) {}

  onSave(): void {
    this.save.emit();
  }

  onCancel(): void {
    this.value = this.defaultValue;
  }

  writeValue(value: any): void {
    this.value = value;
    this.defaultValue = value;
    this.cdr.markForCheck();
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
