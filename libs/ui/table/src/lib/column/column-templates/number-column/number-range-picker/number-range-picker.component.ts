import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-number-range-picker',
  templateUrl: './number-range-picker.component.html',
  styleUrls: ['./number-range-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberRangePickerComponent implements OnInit {
  @Input()
  filterForm: FormGroup;

  from: number;
  to: number;

  ngOnInit(): void {
    this.from = this.filterForm.controls.from.value;
    this.to = this.filterForm.controls.to.value;
  }
}
