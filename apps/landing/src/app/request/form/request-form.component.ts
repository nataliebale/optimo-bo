import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { mapOfCompanyTypes } from './company-type.enum';
import { mapOfPackageTypes } from './package-type.enum';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
})
export class RequestFormComponent implements OnInit, OnDestroy {
  @Input()
  businessTypes: any[];

  @Input()
  defaultValues: any;

  @Output()
  request = new EventEmitter<any>();

  @Output()
  cancel = new EventEmitter<void>();

  @ViewChild('textAreaElement', { static: true }) textarea: ElementRef;

  form: FormGroup;
  packageTypes = mapOfPackageTypes.filter((type) => !type.disabled);
  companyTypes = mapOfCompanyTypes;

  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [
        (this.defaultValues && this.defaultValues.firstName) || '',
        Validators.required,
      ],
      lastName: [
        (this.defaultValues && this.defaultValues.lastName) || '',
        Validators.required,
      ],
      phoneNumber: [
        (this.defaultValues && this.defaultValues.phoneNumber) || '',
        [Validators.required, Validators.minLength(9)],
      ],
      email: [
        (this.defaultValues && this.defaultValues.email) || '',
        Validators.required,
      ],
      companyType: [
        this.defaultValues && this.defaultValues.companyType,
        Validators.required,
      ],
      companyName: [
        (this.defaultValues && this.defaultValues.companyName) || '',
        Validators.required,
      ],
      identificationNumber: [
        (this.defaultValues && this.defaultValues.identificationNumber) || '',
        Validators.required,
      ],
      address: [
        (this.defaultValues && this.defaultValues.address) || '',
        Validators.required,
      ],
      businessType: [
        this.defaultValues && this.defaultValues.businessType,
        Validators.required,
      ],
      packageType: [
        this.defaultValues && this.defaultValues.packageType,
        Validators.required,
      ],
      isUsingManagementSoftware: [
        this.defaultValues && this.defaultValues.isUsingManagementSoftware,
        Validators.required,
      ],
      currentManagementSolutionDescription: [
        (this.defaultValues &&
          this.defaultValues.currentManagementSolutionDescription) ||
          '',
      ],
    });

    this.setDynamicValidators();
  }

  onSubmit(): void {
    const formValue = this.form.getRawValue();
    const body = { ...formValue, businessType: [formValue.businessType] };
    this.request.emit(body);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getControlValue(controlName: string): any {
    return this.form.get(controlName).value;
  }

  private setDynamicValidators(): void {
    this.form.controls.isUsingManagementSoftware.valueChanges.subscribe(
      (value) => {
        const control = this.form.controls.currentManagementSolutionDescription;
        if (value) {
          control.setValidators(Validators.required);
          this.textarea.nativeElement.focus();
        } else {
          control.clearValidators();
        }
        control.updateValueAndValidity();
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
