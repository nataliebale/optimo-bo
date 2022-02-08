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
// tslint:disable-next-line:nx-enforce-module-boundaries
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { HttpResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-catalogue-import-response-popup',
  templateUrl: './catalogue-import-response-popup.component.html',
  styleUrls: ['./catalogue-import-response-popup.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueImportResponsePopupComponent
  implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  response: HttpResponse<Blob>;
  error: boolean;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<CatalogueImportResponsePopupComponent>,
    private fileDownloadHelper: FileDownloadHelper,
    private notifier: NotificationsService,
    @Inject(MAT_DIALOG_DATA) private data: FormData
  ) {}

  ngOnInit(): void {
    this.client
      .post('catalogstockitems/excel/import', this.data, {
        responseType: 'blob',
        file: true,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (response: HttpResponse<Blob>) => {
          console.log(response);
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

  private showResultNotification(): void {
    if (this.error) {
      this.notifier.sayError('პროდუქტების ატვირთვა ვერ განხორციელდა');
      this.dialogRef.close();
    }
    if (this.response && !this.hasError) {
      this.notifier.saySuccess('ყველა პროდუქტი წარმატებით აიტვირთა');
      this.dialogRef.close();
    }
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
