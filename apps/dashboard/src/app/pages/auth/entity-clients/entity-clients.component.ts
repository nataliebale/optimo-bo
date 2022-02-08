import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { Observable } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { BaseListComponent } from '../base-list.component';
import { ClientsImportPopupComponent } from './clients-import/clients-import-popup.component';
import { map, takeUntil } from 'rxjs/operators';
import { EntityClientTransactionPopupComponent } from './transaction-popup/entity-client-transaction-popup.component';
import {
  ApproveDialogComponent,
  DialogData,
} from '@optimo/ui-popups-approve-dialog';
import { ItemStatus } from '../../../core/enums/item-status.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { MixpanelService } from '@optimo/mixpanel';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { pickBy } from 'lodash-es';
import { StockItemStatuses } from '../../../core/enums/stockitem-status.enum';
export interface CLientPriorityDTO {
  entityClientId: number;
  priority: number | null;
}

@Component({
  selector: 'app-entity-clients',
  templateUrl: './entity-clients.component.html',
  styleUrls: ['./entity-clients.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityClientsComponent extends BaseListComponent {
  public textIsTruncated = textIsTruncated;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'dashboardPriority',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      hideInVisibilitySelector: true,
    },
    {
      dataField: 'entityNameOrIdentifier',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.LIST.TABLE_COLUMNS.TITLE',
      filterable: true,
      sortable: true,
      widthCoefficient: 660,
    },
    {
      dataField: 'contactPerson',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.LIST.TABLE_COLUMNS.CONTACT_PERSON',
      filterable: true,
      sortable: true,
      widthCoefficient: 317,
    },
    {
      dataField: 'phoneNumber',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.LIST.TABLE_COLUMNS.PHONE_NUMBER',
      filterable: true,
      sortable: true,
      widthCoefficient: 317,
    },
    {
      dataField: 'email',
      columnType: ColumnType.Text,
      caption: 'ENTITY_CLIENTS.LIST.TABLE_COLUMNS.EMAIL',
      filterable: true,
      sortable: true,
      widthCoefficient: 317,
    },
  ];

  nameField = 'entityName';

  requestIsSent: boolean;

  private _ItemStatus = ItemStatus;

  get activatedHeaderTooltip(): string {
    const activatedRowCount = this.dataSource?.reduce(
      (accumulator, row) =>
        this.isActivated(row) ? accumulator + 1 : accumulator,
      0
    );
    if (!activatedRowCount || activatedRowCount === 0)
      return 'ENTITY_CLIENTS.ADD_TO_FAVORITES';
    // no rows selected
    else return 'ENTITY_CLIENTS.REMOVE_FROM_FAVORITES'; //some/all rows selected
  }

  get activateHeaderIcon(): string {
    const activatedRowCount = this.dataSource?.reduce(
      (accumulator, row) =>
        this.isActivated(row) ? accumulator + 1 : accumulator,
      0
    );
    if (!activatedRowCount || activatedRowCount === 0) return 'empty-star';
    //empty star
    else if (activatedRowCount === this.dataSource.length) return 'full-star';
    //full star
    else return 'outline-star'; //outline star
  }

  onActivateCol(): void {
    const activatedRows = this.dataSource.filter((row) =>
      this.isActivated(row)
    );
    activatedRows.forEach(console.log);
    if (activatedRows.length === 0) {
      // activate all rows
      this.setProductPriority(
        this.dataSource?.map((row) => ({ entityClientId: row.id, priority: 1 }))
      );
    } else if (activatedRows.length <= this.dataSource.length) {
      // deactivate active rows (some or all)
      this.promptDeactivatePopup().subscribe((result) => {
        if (result) {
          this.setProductPriority(
            activatedRows?.map((row) => ({
              entityClientId: row.id,
              priority: null,
            }))
          );
        }
      });
    } else {
      console.error(
        'selected columns and data source mismatch. data:',
        this.dataSource,
        'selected:',
        this.selectedRows
      );
    }
  }

  setProductPriority(itemStatusArray: CLientPriorityDTO[]) {
    if (!itemStatusArray?.length) {
      console.error('can not sern request on 0 items');
      return;
    }
    const data = {
      entityClients: itemStatusArray,
    };

    this.client
      .put<any>('entityclient/setdashboardpriority', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private fileDownloadHelper: FileDownloadHelper,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);

    this._mixpanelService.track('B2B Clients');
  }

  protected get httpGetItems(): Observable<any> {
    /**
     * Because in name field we merged name and identifier, that field name is entityNameOrIdentifier.
     * but in back-end, when sorting, sortField should become "name" not "entityNameOrIdentifier"
     */
    if (
      this.currentState.hasOwnProperty('sortField') &&
      this.currentState['sortField'] === 'entityNameOrIdentifier'
    ) {
      this.currentState['sortField'] = 'entityName';
    }

    const params = new HttpParams({
      fromObject: { ...this.currentState, status: '0' },
    });

    return this.client
      .get<any>('entityclient', { params })
      .pipe(
        map((res) => {
          res.data = res.data.map((item) => {
            return {
              ...item,
              status: item.liabilityDeposit > 0,
              liabilityDeposit: Math.abs(item.liabilityDeposit),
            };
          });

          return res;
        })
      );
  }

  onEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/entity-clients/edit', id]);
  }

  onRSImport(): void {
    this.openView(ClientsImportPopupComponent, null);
  }

  isRowSelectable = (row: any): boolean => {
    return row?.id !== -1;
  };

  onOpenTransactionPopup(): void {
    this.dialog
      .open(EntityClientTransactionPopupComponent, {
        width: '510px',
        data: this.selectedRows[0].id,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
        }
      });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : { ids: this.selectedRows.map((r) => r.id) };
    return this.client.delete('entityclient', data);
  }

  public isActivated(row?: any): boolean {
    return (
      (row && Number.isInteger(row.dashboardPriority)) ||
      (!row &&
        this.selectedRows &&
        this.selectedRows[0] &&
        Number.isInteger(this.selectedRows[0].dashboardPriority))
    );
  }

  onToggleActivate(row?: any): void {
    if (this.isActivated(row)) {
      this.deactivateSelectedRows(row);
      return;
    }
    this.toggleActivate(1, row);
  }

  private toggleActivate(priority: number, row?: any): void {
    const data =
      row && row.id
        ? { entityClients: [{ entityClientId: row.id, priority }] }
        : {
            entityClients: this.idsOfSelectedItems.map((id) => ({
              entityClientId: id,
              priority,
            })),
          };

    this.client
      .put<any>('entityclient/setdashboardpriority', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  private deactivateSelectedRows(row?: any): void {
    this.promptDeactivatePopup().subscribe((result) => {
      if (result) {
        this.toggleActivate(null, row);
      }
    });
  }

  private promptDeactivatePopup(): Observable<any> {
    return this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: `ENTITY_CLIENTS.DEACTIVATE_MESSAGE`,
          approveBtnLabel: 'ENTITY_CLIENTS.YES',
          denyBtnLabel: 'ENTITY_CLIENTS.NO',
        } as DialogData,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$));
  }

  showHide(row: any): void {
    if (row.categoryStatus === ItemStatus.Disabled) {
      return;
    }
    const status: ItemStatus = row.status;
    const id: number = row.id;
    const payload = {
      status:
        status === this._ItemStatus.Disabled
          ? this._ItemStatus.Enabled
          : this._ItemStatus.Disabled,
      id,
    };
    this.client
      .put<any>('stockitems/status', payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  getActivatedTitle(row): string {
    return this.isActivated(row)
      ? 'ENTITY_CLIENTS.REMOVE_FROM_FAVORITES'
      : 'ENTITY_CLIENTS.ADD_TO_FAVORITES';
  }

  onExport(): void {
    this.client
      .get<any>('entityclient/excel', {
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel',
          'Clients.xlsx'
        );
      });
  }

  private get requestBody(): HttpParams {
    const { name, ...state } = this.currentState;
    const data = pickBy(
      {
        ...state,
        status: 0,
      },
      (val) => val || (val as any) === 0
    );

    return new HttpParams({
      fromObject: data as any,
    });
  }
}
