import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-request-demo-form',
  templateUrl: './request-demo-form.component.html',
})
export class RequestDemoFormComponent implements OnDestroy {
  @Output()
  request = new EventEmitter<any>();

  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.minLength(9)]],
    email: ['', Validators.required],
    companyName: ['', Validators.required],
    inn: ['', Validators.required],
    address: ['', Validators.required],
  });

  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  onSubmit(): void {
    const formValue = this.form.getRawValue();
    this.request.emit(formValue);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
