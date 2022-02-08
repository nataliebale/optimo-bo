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
import { EMPTY, Subject, Observable } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { CustomValidators } from './../../../../core/helpers/validators/validators.helper';

@Component({
  selector: 'app-faq-category-detail',
  templateUrl: './faq-category-detail.component.html',
  styleUrls: ['./faq-category-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FAQCategoryDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editFaqCategory: any;
  isSubmited: boolean;
  categories: any;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<FAQCategoryDetailComponent>,
    private fb: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }

  createForm(faqCategory: any) {
    this.form = this.fb.group({
      urlSlug: [faqCategory && faqCategory.urlSlug, [Validators.required]],
      nameGEO: [faqCategory && faqCategory.nameGEO, [Validators.required]],
      nameENG: [faqCategory && faqCategory.nameENG, [Validators.required]],
      nameRUS: [faqCategory && faqCategory.nameRUS, [Validators.required]],
      sortIndex: [
        faqCategory && faqCategory.sortIndex,
        [Validators.required, CustomValidators.OnlyNumbers],
      ],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }
  onCancel(): void {
    this.location.back();
  }

  onClose(): void {
    this.bottomSheetRef.dismiss('/faq-categories');
  }

  getItemForEdit(): void {
    this.clientService
      .get(`faqcategories/single?id=${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: any) => {
        if (!result) {
          this.close();
        }
        console.log('category -> ', result);
        this.editFaqCategory = result;
        this.createForm(result);
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss(true);
  }

  async onSubmit() {
    this.isSubmited = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.cdr.markForCheck();
      console.log('form is invalid');
      return;
    }

    const formRawValues = this.form.getRawValue();
    const requestBody = {
      id: this?.editFaqCategory?.id,
      categoryId: formRawValues.category,
      ...formRawValues,
    };

    if (this.editId) {
      this.clientService
        .put<any>(`faqcategories`, requestBody)
        .pipe(
          catchError(() => {
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
        .post<any>('faqcategories', requestBody)
        .pipe(
          catchError(() => {
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
    }
  }

  get title(): string {
    return this.editId ? 'რედაქტირება' : 'დამატება';
  }
}
