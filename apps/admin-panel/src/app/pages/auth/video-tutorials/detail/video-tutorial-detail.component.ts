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
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-video-tutorial-detail',
  templateUrl: './video-tutorial-detail.component.html',
  styleUrls: ['./video-tutorial-detail.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoTutorialDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  editId: number;
  editVideoTutorial: any;
  isSubmited: boolean;
  categories: any;

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<VideoTutorialDetailComponent>,
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

  createForm(videoTutorial: any) {
    this.form = this.fb.group({
      title: [videoTutorial && videoTutorial.title, [Validators.required]],
      url: [videoTutorial && videoTutorial.url, [Validators.required]],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }
  onCancel(): void {
    this.location.back();
  }

  onClose(): void {
    this.bottomSheetRef.dismiss('/video-tutorials');
  }

  getItemForEdit(): void {
    this.clientService
      .get(`videotutorials/single?id=${this.editId}`)
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
        console.log('tutorial -> ', result);
        this.editVideoTutorial = result;
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
      id: this?.editVideoTutorial?.id,
      categoryId: formRawValues.category,
      ...formRawValues,
    };

    if (this.editId) {
      this.clientService
        .put<any>(`videotutorials`, requestBody)
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
        .post<any>('videotutorials', requestBody)
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
