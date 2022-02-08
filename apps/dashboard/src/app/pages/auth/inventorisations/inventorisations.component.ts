import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { Observable } from 'rxjs';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { BaseListComponent } from '../base-list.component';
import {
  INVENTORISATION_STATUS_DATA,
  InventorisationStatus,
} from '../../../core/enums/inventorisation-status.enum';
import {
  INVENTORISATION_TYPE_DATA,
  InventorisationType,
} from '../../../core/enums/inventorisation-type.enum';
import { LoadingPopupComponent } from '../../../popups/loading-popup/loading-popup.component';
import { takeUntil } from 'rxjs/operators';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { MessagePopupComponent } from '../../../popups/message-popup/message-popup.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { InventorisationMismatchesComponent } from './mismatches/inventorisation-mismatches.component';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-inventorisations',
  templateUrl: './inventorisations.component.html',
  styleUrls: ['./inventorisations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorisationsComponent extends BaseListComponent {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'Inventorisations.List.TableColumns.name',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 3.5,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'Inventorisations.List.TableColumns.type',
      filterable: true,
      sortable: true,
      data: INVENTORISATION_TYPE_DATA,
    },
    {
      dataField: 'status',
      columnType: ColumnType.Dropdown,
      caption: 'Inventorisations.List.TableColumns.status',
      filterable: true,
      sortable: true,
      data: INVENTORISATION_STATUS_DATA,
    },
    {
      dataField: 'orderDate',
      columnType: ColumnType.Date,
      caption: 'Inventorisations.List.TableColumns.orderDate',
      filterable: true,
      sortable: true,
    },
  ];

  statusData = INVENTORISATION_STATUS_DATA;

  isUploadDropdownActive: boolean;

  constructor(
    private fileDownloadHelper: FileDownloadHelper,
    private client: ClientService,
    private bottomSheet: MatBottomSheet,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Stock Takes');
  }

  protected get httpGetItems(): Observable<any> {
    let params = new HttpParams({
      fromObject: this.currentState as any,
    });
    if (!this.currentState.hasOwnProperty('status')) {
      params = params
        .append('status', InventorisationStatus.Draft.toString())
        .append('status', InventorisationStatus.Succeeded.toString());
    }
    if (!this.currentState.hasOwnProperty('type')) {
      params = params
        .append('type', InventorisationType.Partial.toString())
        .append('type', InventorisationType.Full.toString());
    }

    return this.client.get<any>('stocktakeorders', { params });
  }

  onEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/inventorisations/edit', id]);
  }

  onExcelDownload(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    const request = this.client.get<any>(`stocktakeorders/${id}/excel`, {
      responseType: 'blob',
    });
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს ჩამოტვირთვა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        if (response) {
          this.fileDownloadHelper.downloadFromResponse(
            response,
            'application/ms-excel'
          );
        }
      });
  }

  onExcelUpload(fileList: any): void {
    const id =
      this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id;

    const file = fileList && fileList[0];
    const formData = new FormData();
    formData.append('file', file, file.name);

    const request = this.client.post<any>(
      `stocktakeorders/${id}/excel/import`,
      formData,
      { responseType: 'json', file: true }
    );

    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს ატვირთვა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ hasErrors, data }) => {
        // this._mixpanelService.track('Add Stock Take (Success)');ს
        if (!hasErrors && (!data || !data.length)) {
          this.openSuccessInventorisationPopup(id);
        } else {
          this.openMismatchesPopup({ id, hasErrors, data, formData });
        }
      });
  }

  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.cdr.markForCheck();
  }

  private openMismatchesPopup(params: any): void {
    this.bottomSheet
      .open(InventorisationMismatchesComponent, {
        panelClass: ['dialog-full-page', 'mat-bottom-sheet-container-xlarge'],
        closeOnNavigation: true,
        disableClose: true,
        data: params,
      })
      .afterDismissed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((r) => {
        if (r) {
          this.notificator.saySuccess('ინვენტარიზაცია წარმატებით დასრულდა');
          this.requestItems.next();
        }
      });
  }

  private openSuccessInventorisationPopup(id: number): void {
    // const popup: MatDialogRef<MessagePopupComponent, any> = this.dialog.open(
    //   MessagePopupComponent,
    //   {
    //     width: '510px',
    //     data: {
    //       message: 'ინვენტარიზაცია დასრულდა ცვლილებების გარეშე',
    //       btnLabel: 'დახურვა',
    //     },
    //   }
    // );

    // popup.afterOpened().subscribe(() => {});

    // popup.afterClosed().subscribe(() => {
    //   this.requestItems.next();
    // });
    this.notificator.saySuccess('ინვენტარიზაცია დასრულდა ცვლილებების გარეშე');
    this.client
      .put('stocktakeorders/finish', {
        id: id,
        orderLines: [],
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this._mixpanelService.track('Edit Stock Take (Success)');
        this.requestItems.next();
      });
    this.requestItems.next();
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete<any>('stocktakeorders', data);
  }

  get isAnySucceeded(): boolean {
    return this.selectedRows.some(
      (row) => row.status === InventorisationStatus.Succeeded
    );
  }

  isRowDraft(row: any): boolean {
    return row.status === InventorisationStatus.Draft;
  }
}
