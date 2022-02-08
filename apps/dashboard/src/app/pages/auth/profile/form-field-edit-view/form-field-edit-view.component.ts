import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

export enum EFieldType {
  Number = 1,
  Text = 2,
  Percentage = 3,
  Radio = 4,
}

@Component({
  selector: 'app-form-field-edit-view',
  templateUrl: './form-field-edit-view.component.html',
  styleUrls: ['./form-field-edit-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldEditViewComponent implements OnInit {
  public EFieldType = EFieldType;

  public editMode: boolean;

  private oldValue: any;

  @Input() value: any;

  @Input() isIntegration: any;

  @Input() fieldType: EFieldType;

  @Input() form: FormGroup;

  @Input() fieldName: string;

  @Input() disabled: boolean;

  @Output() save = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {}

  public onSave(): void {
    event.stopPropagation();
    this.editMode = false;
    this.save.emit(this.fieldName);
  }

  public switchToEditMode(): void {
    event.stopPropagation();
    this.editMode = true;
    this.oldValue = this.form.get(this.fieldName).value;
  }

  public onClickOutside(): void {
    event.stopPropagation();
    if (this.editMode) {
      this.form.patchValue({
        [this.fieldName]: this.oldValue,
      });
      this.editMode = false;
    }
  }
}
