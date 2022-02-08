import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectionData, ColumnType, ColumnData } from '@optimo/ui-table';
import { takeUntil } from 'rxjs/operators';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-suppliers-import-popup',
  templateUrl: './suppliers-import-popup.component.html',
  styleUrls: ['./suppliers-import-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersImportPopupComponent implements OnInit, OnDestroy {
  dataSource: any[];
  selectedRows: any[];
  columns: ColumnData[] = [
    {
      dataField: 'sellerName',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.SUPPLIER_IMPORT.LIST.TABLE_COLUMNS.TITLE',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'sellerTIN',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.SUPPLIER_IMPORT.LIST.TABLE_COLUMNS.SELLER_IIN',
      filterable: false,
      sortable: true,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private dialogRef: MatDialogRef<SuppliersImportPopupComponent>,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Import Suppliers');
  }

  ngOnInit(): void {
    this.client
      .get('waybills/sellers')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
        this.dataSource = data;
        this.cdr.markForCheck();
      });
  }

  onImport(): void {
    this.client
      .post('suppliers/batch', {
        suppliers: this.selectedRows.map((row) => ({
          inn: row.sellerTIN,
          name: row.sellerName,
        })),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess(
          this.translate.instant(
            'SUPPLIERS.SUPPLIER_IMPORT.SUCCESS_MESSAGE'
          )
        );
        this.dialogRef.close(true);
      });
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  alwaysEnabled = () => true;

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
