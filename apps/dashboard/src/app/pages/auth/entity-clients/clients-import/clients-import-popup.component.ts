import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectionData, ColumnType, ColumnData } from '@optimo/ui-table';
import { takeUntil } from 'rxjs/operators';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clients-import-popup',
  templateUrl: './clients-import-popup.component.html',
  styleUrls: ['./clients-import-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsImportPopupComponent implements OnInit, OnDestroy {
  dataSource: any[];
  selectedRows: any[];
  columns: ColumnData[] = [
    {
      dataField: 'buyerName',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.CLIENTS_IMPORT.LIST.TABLE_COLUMNS.BUYER_NAME',
      filterable: false,
      sortable: true,
    },
    {
      dataField: 'buyerTIN',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.CLIENTS_IMPORT.LIST.TABLE_COLUMNS.BUYER_INN',
      filterable: false,
      sortable: true,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private dialogRef: MatDialogRef<ClientsImportPopupComponent>,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.client
      .get('waybills/buyers')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any[]) => {
        this.dataSource = data;
        this.cdr.markForCheck();
      });
  }

  onImport(): void {
    this.client
      .post('entityclient/batch', {
        entities: this.selectedRows.map((row) => ({
          entityIdentifier: row.buyerTIN,
          entityName: row.buyerName,
        })),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.notificator.saySuccess(
          this.translate.instant('ENTITY_CLIENTS.SUCCESS_MESSAGE')
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
