import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  forwardRef,
  ChangeDetectorRef,
} from '@angular/core';
import { getYear } from 'date-fns';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-year-select',
  templateUrl: './year-select.component.html',
  styleUrls: ['./year-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YearSelectComponent),
      multi: true,
    },
  ],
})
export class YearSelectComponent implements ControlValueAccessor, OnInit {
  private _value: number;

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  years: number[] = [];

  isDisabled: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const currentYear = getYear(Date.now());
    let i = 0;
    while (i < 30) {
      this.years.push(currentYear - i);
      i++;
    }
  }

  writeValue(value: number): void {
    if (value) {
      this.value = value;
    }
  }

  onChange = (val: any) => {};

  onTouched = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
    if (!this.value) {
      fn(getYear(Date.now()));
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }
}
