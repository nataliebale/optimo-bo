import { NotificationsService } from './../../../../../../../admin-panel/src/app/core/services/notifications/notifications.service';
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
  selector: 'app-import-ingredients-response-popup',
  templateUrl: './import-ingredients-response-popup.component.html',
  styleUrls: ['./import-ingredients-response-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportIngredientsResponsePopupComponent
  implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  response: HttpResponse<Blob>;
  error: boolean;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<ImportIngredientsResponsePopupComponent>,
    private notifier: NotificationsService,
    private fileDownloadHelper: FileDownloadHelper,
    @Inject(MAT_DIALOG_DATA) private data: FormData
  ) {}

  ngOnInit(): void {
    this.client
      .post('stockitems/import-excel/ingredient', this.data, {
        responseType: 'blob',
        file: true,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (response: HttpResponse<Blob>) => {
          this.response = response;
          this.showResultNotification();
          this.cdr.markForCheck();
        },
        () => {
          this.error = true;
          this.showResultNotification();
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

  private showResultNotification(): void {
    if (this.error) {
      this.notifier.sayError('ინგრედიენტების ატვირთვა ვერ განხორციელდა');
      this.dialogRef.close();
    } else if (this.response && !this.hasError) {
      this.notifier.saySuccess('ყველა ინგრედიენტი წარმატებით აიტვირთა');
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
