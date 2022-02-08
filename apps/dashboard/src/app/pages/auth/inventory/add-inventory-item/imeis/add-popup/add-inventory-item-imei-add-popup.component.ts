import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Component({
  selector: 'app-add-inventory-item-imei-add-popup',
  templateUrl: './add-inventory-item-imei-add-popup.component.html',
  styleUrls: ['./add-inventory-item-imei-add-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInventoryItemImeiAddPopupComponent implements OnInit {
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<AddInventoryItemImeiAddPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { editIMEI: string; IMEIs: string[] },
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm();
  }
  private createForm(): void {
    this.form = this.fb.group({
      imei: [
        this.data.editIMEI || '',
        [Validators.required, CustomValidators.uniq(this.data.IMEIs)],
      ],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close(this.getValue('imei'));
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get isNotUniq(): boolean {
    const { errors } = this.form.controls.imei;
    return errors && errors.uniq;
  }

  private getValue(controlName): string | number {
    return this.form.controls[controlName].value;
  }
}
