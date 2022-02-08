import {
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { Observable } from 'rxjs';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { SupplierStatuses } from '../../../core/enums/supplier-statuses.enum';
import { BaseListComponent } from '../base-list.component';
import { NumberColumnType } from '@optimo/ui-table';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SuppliersTransactionPopupComponent } from './transaction-popup/suppliers-transaction-popup.component';
import { SuppliersImportPopupComponent } from './suppliers-import/suppliers-import-popup.component';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../core/services/location/location.service';
import { approveAction } from '@optimo/ui-popups-approve-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersComponent extends BaseListComponent {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.TITLE',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'contactName',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.CONTACT_NAME',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'phoneNumber',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.PHONE_NUMBER',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'email',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.EMAIL',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'balance',
      columnType: ColumnType.Number,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.BALANCE',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
        statusFieldName: 'status',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'bankAccountNumber',
      columnType: ColumnType.Text,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.BANK_ACCOUNT_NUMBER',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'isVATRegistered',
      columnType: ColumnType.Dropdown,
      caption: 'SUPPLIERS.LIST.TABLE_COLUMNS.IS_VAT_REGISTERED',
      filterable: true,
      sortable: true,
      data: {
        true: 'SUPPLIERS.LIST.FILTER_OPTIONS.YES',
        false: 'SUPPLIERS.LIST.FILTER_OPTIONS.NO',
      },
    },
  ];

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Suppliers');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client
      .get<any>('suppliers', {
        params: new HttpParams({
          fromObject: {
            ...this.currentState,
            status: SupplierStatuses.Enabled.toString(),
          },
        }),
      })
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

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.router.navigate(['/suppliers/edit/' + id]);
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : {
            ids: this.idsOfSelectedItems,
          };
    return this.client.delete('suppliers', data);
  }

  goToAddNewItem(): void {
    this.router.navigate(['/suppliers/add']);
  }

  goToStatistics(): void {
    if (this.selectedRows && this.selectedRows.length === 1) {
      this.router.navigate(['/statistics/supplier'], {
        queryParams: { supplierId: this.selectedRows[0].id },
      });
    }
  }

  goToAddProducts(): void {
    this.router.navigate([
      `/suppliers/add-products/${this.selectedRows[0].id}`,
    ]);
  }

  // onOpenTransactionPopup(): void {
  //   this.dialog
  //     .open(SuppliersTransactionPopupComponent, {
  //       width: '548px',
  //       data: this.selectedRows[0].id,
  //     })
  //     .afterClosed()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe((result) => {
  //       if (result) {
  //         this.requestItems.next();
  //       }
  //     });
  // }

  removeItems(row?: any): void {
    this._locationService
      .getLocations()
      .pipe(
        tap((locations) => console.log('dev => locations =>', locations)),
        takeUntil(this.unsubscribe$),
        map((locations) => (locations.length > 1 ? true : false)), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) =>
          approveAction(
            this.dialog,
            {
              title: 'GENERAL.APPROVE_DELETE',
              message: hasMultipleLocations
                ? 'GENERAL.APPROVE_SUPPLIER_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() => this.requestDeleteItems(row))
      )
      .subscribe((res) => {
        this.notificator.saySuccess(
          this.translate.instant('SUPPLIERS.DELETED_SUCCESSFULLY_MESSAGE')
        );
        console.log('dev => itemsDeleted => res:', res);
        this.requestItems.next();
      });
  }

  onRSImport(): void {
    this.openView(SuppliersImportPopupComponent, null, [
      'mat-w-800',
      'mat-h-598',
    ]);
  }
}
