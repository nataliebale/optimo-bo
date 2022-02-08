import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { HttpResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-distributor-form-import-response-popup',
  templateUrl: './distributor-form-import-response-popup.component.html',
  styleUrls: ['./distributor-form-import-response-popup.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributorFormImportResponsePopupComponent
  implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  response: HttpResponse<Blob>;
  error: boolean;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<
      DistributorFormImportResponsePopupComponent
    >,
    private fileDownloadHelper: FileDownloadHelper,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {}

  ngOnInit(): void {
    this.client
      .post(
        `supplier/excel/import?id=${this.data.id}`,
        this.data.formData,
        {
          responseType: 'blob',
          file: true,
        }
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (response: HttpResponse<Blob>) => {
          console.log(response);
          this.response = response;
          this.cdr.markForCheck();
        },
        () => {
          this.error = true;
          this.cdr.markForCheck();
        }
      );
  }

  onExport(): void {
    this.fileDownloadHelper.downloadFromResponse(
      this.response,
      'application/ms-excel'
    );
  }

  get hasError(): boolean {
    return !!this.response.body.size;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
