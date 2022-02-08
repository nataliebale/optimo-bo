import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ClientService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-business-type-detail',
  templateUrl: './business-type-detail.component.html',
  styleUrls: ['./business-type-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessTypeDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editBusinessType: any;
  isSubmited: boolean;
  alreadyExists: boolean;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    // @Inject(MAT_BOTTOM_SHEET_DATA) private bottomShettParams: any,
    private dialogRef: MatDialogRef<BusinessTypeDetailComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogParams,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.editId = this.bottomShettParams?.id;
    this.editId = this.dialogParams?.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }

  createForm(businessType: any) {
    this.form = this.fb.group({
      name: [businessType && businessType.name, [Validators.required]],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }

  onCancel() {
    this.dialogRef.close(true);
  }

  getItemForEdit(): void {
    this.clientService
      .get(`businesstypes/${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.onCancel();
        }
        console.log('business type -> ', result);
        this.editBusinessType = result;
        this.createForm(result);
      });
  }

  onClose(): void {
    // this.bottomSheetRef.dismiss('/business-types');
    this.dialogRef.close(true);
  }

  async onSubmit() {
    this.alreadyExists = false;
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }
    const formRawValues = this.form.getRawValue();
    const requestBody = { name: formRawValues.name };
    console.log(
      'businessTypesDetail -> onSubmit -> ',
      formRawValues.name,
      requestBody
    );

    if (this.editId) {
      this.clientService
        .put<any>(`businesstypes/${this.editId}`, requestBody)
        .pipe(
          catchError((error) => {
            this.checkBusinessTypeName(error);
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          this.onClose();
        });
    } else {
      this.clientService
        .post<any>('businesstypes', requestBody)
        .pipe(
          catchError((error) => {
            this.checkBusinessTypeName(error);
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((result) => {
          if (!result) {
            this.onCancel();
          }
          console.log('saved item: ', result);

          this.onClose();
        });
    }
  }

  private checkBusinessTypeName(result) {
    if (
      result &&
      result.error &&
      result.error.indexOf('already exists') !== -1
    ) {
      this.form.controls['name'].setValue(null);
      this.form.get('name').markAsTouched();
      this.alreadyExists = true;
      if (this.form.invalid) {
        this.cdr.markForCheck();
        console.log('form is invalid');
        return;
      }
    }
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }
}
