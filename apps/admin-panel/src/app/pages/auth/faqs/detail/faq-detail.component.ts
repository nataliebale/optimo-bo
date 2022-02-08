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
import { CustomValidators } from './../../../../core/helpers/validators/validators.helper';

@Component({
  selector: 'app-faq-detail',
  templateUrl: './faq-detail.component.html',
  styleUrls: ['./faq-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FAQDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editFaq: any;
  isSubmited: boolean;
  categories: any;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<FAQDetailComponent>,
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

  createForm(faq: any) {
    this.form = this.fb.group({
      category: [faq && faq.category.id, [Validators.required]],
      urlSlug: [faq && faq.urlSlug, [Validators.required]],
      questionGEO: [faq && faq.questionGEO, [Validators.required]],
      questionENG: [faq && faq.questionENG, [Validators.required]],
      questionRUS: [faq && faq.questionRUS, [Validators.required]],
      answerGEO: [faq && faq.answerGEO, [Validators.required]],
      answerENG: [faq && faq.answerENG, [Validators.required]],
      answerRUS: [faq && faq.answerRUS, [Validators.required]],
      sortIndex: [
        faq && faq.sortIndex,
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
    this.bottomSheetRef.dismiss('/faqs');
  }

  getItemForEdit(): void {
    this.clientService
      .get(`faqs/single?id=${this.editId}`)
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
        this.editFaq = result;
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
      id: this?.editFaq?.id,
      categoryId: formRawValues.category,
      ...formRawValues,
    };

    if (this.editId) {
      this.clientService
        .put<any>(`faqs`, requestBody)
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
        .post<any>('faqs', requestBody)
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

  getCategories = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'nameGEO',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('nameGEO', state.searchValue);
    }

    return this.clientService.get<any>('faqcategories', { params });
  };

  getCategoryById = (id: number): Observable<any> => {
    return this.clientService.get<any>(`faqcategories/single?id=${id}`);
  };
}
