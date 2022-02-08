import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../../../core/services/notifications/notifications.service';
import { EMPTY, Subject} from 'rxjs';
import { catchError, takeUntil, tap, map } from 'rxjs/operators';
import { FileDownloadHelper } from '../../../../../core/helpers/file-download/file-download.helper.ts';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export enum UploadStatus {
  Uploading,
  PendingError,
  Uploaded,
}

export interface ISelectedFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
}

@Component({
  selector: 'app-order-lines-excel-import',
  templateUrl: './order-lines-excel-import.component.html',
  styleUrls: ['./order-lines-excel-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: OrderLinesExcelImportComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: OrderLinesExcelImportComponent,
    }
  ]
})
export class OrderLinesExcelImportComponent implements OnInit, ControlValueAccessor {
  @ViewChild('uploadPopup')
  private uploadPopup: TemplateRef<any>;

  @Input()
  shippingId: number;

  unsubscribe$ = new Subject<void>();

  response: HttpResponse<Blob>;

  uploadStatusEnum = UploadStatus;

  uploadStatus: UploadStatus;

  onChange: (_: ISelectedFile) => void;
  onTouched: () => void;

  selectedFile: ISelectedFile;

  private uploadPopupRef: MatDialogRef<any>;

  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private notifier: NotificationsService,
    private translate: TranslateService,
  ) { }

  writeValue(fileObj: ISelectedFile): void {
    this.selectedFile = fileObj;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
  }

  downloadBlank(): void {
    this.client
      .get<any>('stocktransferorders/orderlines-excel-import-template', {
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
  }

  downloadOrderLinesExcel(): void {
    if (!this?.selectedFile?.fileUrl) {
      console.error('file not present !');
    } else {
      this.client
      .get<any>(this.selectedFile.fileUrl, {
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
    }
  }

  onUpload(fileList: any): void {
    if (!this.shippingId) {
      console.error('order has not been created! no orderId provided');
    }
    const file = fileList && fileList[0];

    const formData = new FormData();
    formData.append('file', file, file.name);
    console.log('dev => file name:', file.name);
    this.uploadPopupRef = this.dialog.open(this.uploadPopup, {panelClass:'mat-dialog-clean',width: 'auto', height: 'auto', disableClose: true});
    this.uploadPopupRef
      .afterClosed()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(_ => this.onTouched());
    this.uploadStatus = UploadStatus.Uploading;
    this.client
      .post(`stocktransferorders/orderlines-excel-import?stockTransferOrderId=${this.shippingId}`, formData, {
        responseType: 'blob',
        file: true,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (response: HttpResponse<Blob>) => {
          this.response = response;
          if (!response.body.size) {
            this.handleFileUploaded();
          } else {
            this.uploadStatus = UploadStatus.PendingError;
            this.selectedFile = {
              fileId: null,
              fileName: null,
              fileUrl: null,
            }
            this.onChange(this.selectedFile);
            
          }
          console.log('dev => response downloaded', response);
          this.cdr.markForCheck();
        },
        () => {
          this.uploadPopupRef.close();
          console.log('dev => file upload error');
          this.cdr.markForCheck();
        }
      );
  }

  private handleFileUploaded(): void {
    this.client
      .get<any>(`stocktransferorders/${this.shippingId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (res) => {
          console.log('dev => handleFileUploaded => res:', res);
          if (res.excelFileName) {
            this.notifier.saySuccess(this.translate.instant('Shipping.Item.Details.notifications.productsUploadSuccess'));
            this.uploadStatus = UploadStatus.Uploaded;
            this.selectedFile = {
              fileId: res.excelFileName,
              fileName: res.excelFileName,
              fileUrl: res.excelFileUrl,
            }
            this.onChange(this.selectedFile);
            this.uploadPopupRef.close();
          } else {
            console.error('uploaded file data fetch failed');
            return;
          }
          this.uploadPopupRef.close();
          this.cdr.markForCheck();
        }
      );
  }

  downloadResponse(): void {
    this.fileDownloadHelper.downloadFromResponse(
      this.response,
      'application/ms-excel'
    );
  }

  downloadFile(): void {
    if (!this.selectedFile.fileUrl) {
      console.error('no file selected');
      return;
    }
    window.open(this.selectedFile.fileUrl);
  }

  onClose() {
    this.uploadPopupRef.close()
  }

  onDelete() {
    // console.log('dev => OrderLinesExcelImport => onDelete');
    // this.selectedFile = {fileName: null, fileId: null, fileUrl: null};
    // this.onChange(this.selectedFile);
    this.client.put(`stocktransferorders/clear-file?id=${this.shippingId}`, {id: this.shippingId})
      .pipe(
        takeUntil(this.unsubscribe$),
        tap(res => console.log('dev => OrderLinesExcelImportComponent => onDelete tap res:', res)),
        map(_ => 'success'),
      )
      .subscribe(res => {
        if (res) {
          this.selectedFile = {fileName: null, fileId: null, fileUrl: null};
          this.onChange(this.selectedFile);
          this.notifier.saySuccess(this.translate.instant('Shipping.Item.Details.notifications.productsClearSuccess'));
        }
        this.cdr.markForCheck();
      })
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    let validationErrors: ValidationErrors = {};
    const requiredErrors = Validators.required(control);
    if (requiredErrors) {
      validationErrors = {
        ...validationErrors,
        ...requiredErrors
      }
    }
    const selectedFile: ISelectedFile = control?.value;
    if (!selectedFile?.fileId || selectedFile?.fileId === '') {
      validationErrors['fileId'] = 'sekectedFile.fileId not set or empty'
    }
    if (!selectedFile?.fileName || selectedFile?.fileName === '') {
      validationErrors['fileName'] = 'sekectedFile.fileName not set or empty'
    }
    if (!selectedFile?.fileUrl || selectedFile?.fileUrl === '') {
      validationErrors['fileUrl'] = 'sekectedFile.fileUrl not set or empty'
    }
    console.log('dev => excel file validation errors:', Object.keys(validationErrors).length > 0 ? validationErrors : null);
    return null;// Object.keys(validationErrors).length > 0 ? validationErrors : null;
  }

}
