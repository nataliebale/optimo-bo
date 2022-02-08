import {
  Component,
  OnInit,
  Input,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { IOffer } from '../../../../models/IOffer';
import { Router } from '@angular/router';
import { QlModules } from './quill-modules';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkRow } from '@angular/cdk/table';
// import SnowTheme from 'quill/themes/snow'

export enum UploadImageType {
  logo = 0,
  photo = 1,
}
@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDetailComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  offerPhoto: any;
  editId: number;
  pdfUrl: string;
  editOffer: IOffer;
  offerContent: String;
  textData: string;

  logoName: string;

  isSubmited: boolean;

  editorFocused: boolean;

  copiedTooltipVisible = false;

  // snowTheme = SnowTheme;
  qlModules = QlModules;

  createForm(offerToEdit: IOffer) {
    this.form = this.formBuilder.group({
      logoId: [offerToEdit && offerToEdit.logo],
      logoName: [offerToEdit && offerToEdit.logoName],
      documentName: [offerToEdit && offerToEdit.documentName],
      photoId: [offerToEdit && offerToEdit.photo, [Validators.required]],
      companyName: [
        offerToEdit && offerToEdit.companyName,
        [Validators.required],
      ],
      category: [offerToEdit && offerToEdit.category, [Validators.required]],
      text: [offerToEdit && offerToEdit.text, [Validators.required]],
    });
    console.log('form values:', this.form.getRawValue());
    this.cdr.markForCheck();
  }

  onCancel() {
    this.close();
  }

  getItemForEdit(): void {
    this.clientService
      .get(`offers/single?id=${this.editId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result: IOffer) => {
        if (!result) {
          this.close();
        }
        console.log('offerToedt', result);
        this.editOffer = result;
        this.createForm(result);
        this.pdfUrl = result.documentName;
        this.logoName = result.logoName;
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss('/offers');
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
    console.log('save form', formRawValues);

    const requestBody = {
      id: this?.editOffer?.id,
      companyName: formRawValues.companyName,
      category: formRawValues.category,
      logoId: formRawValues.logoId,
      text: formRawValues.text,
      photoId: formRawValues.photoId,
      logoName: formRawValues.logoName,
      documentName: formRawValues.documentName,
    };

    if (this.editId) {
      this.clientService
        .put<any>('offers', requestBody)
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
          console.log('saved item: ', result);
          this.close();
        });
    } else {
      this.clientService
        .post<any>('offers', requestBody)
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
          console.log('saved item: ', result);
          this.close();
        });
    }
  }

  onPhotoUploaded(event: any, uploadImageType: UploadImageType) {
    const imageControl = this.form.get(
      uploadImageType === UploadImageType.logo ? 'logoId' : 'photoId'
    );
    if (uploadImageType === UploadImageType.logo) {
      this.form.get('logoName').setValue(event.fileName);
      this.logoName = event.fileName;
    }
    imageControl.setValue(event.response);
    imageControl.markAsDirty();
    console.log('picture set:', imageControl.value);
  }

  onPdfUpload(response: any) {
    console.log('response is:', response);
    this.pdfUrl = response.fileUrl;
    this.form.get('documentName').setValue(response.fileUrl);
    this.clipboard.copy(response.fileUrl);
    this.showCopiedTooltip(2000);
    console.log('copied to clipboard');
  }

  showCopiedTooltip(timeMillis: number): void {
    this.copiedTooltipVisible = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.dismissCopiedTooltip();
    }, timeMillis);
  }

  dismissCopiedTooltip(): void {
    this.copiedTooltipVisible = false;
    this.cdr.markForCheck();
  }

  updateQuillValidity() {
    this.form.get('text').updateValueAndValidity();
  }

  get showInvalidMessage(): boolean {
    console.log('show invalid message', this.isSubmited, this.form?.invalid);
    return this.isSubmited && this.form?.invalid;
  }

  constructor(
    private location: Location,
    private bottomSheetRef: MatBottomSheetRef<OfferDetailComponent>,
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private router: Router,
    private clipboard: Clipboard,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.editId = this.params && this.params.id;
    if (this.editId) {
      this.getItemForEdit();
    } else {
      this.createForm(null);
    }
  }
}
