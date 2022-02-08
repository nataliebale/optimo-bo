import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ClientService } from '@optimo/core';
import { ColumnType, ColumnData } from '@optimo/ui-table';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BaseListComponent } from '../base-list.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { takeUntil, tap } from 'rxjs/operators';
import { LocationStatus } from '../../../core/enums/location-status.enum';
import { AddLocationModalComponent } from './add-location-modal/add-location-modal.component';
import { StorageService } from '@optimo/core';
import { EventBusService } from '../../../core/services/event-bus-service/event-bus.service';
import { LocationService } from '../../../core/services/location/location.service';
import { TranslateService } from '@ngx-translate/core';
import { MixpanelService } from '@optimo/mixpanel';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsComponent extends BaseListComponent
  implements OnInit, OnDestroy {
  public textIsTruncated = textIsTruncated;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_2',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'address',
      columnType: ColumnType.Text,
      caption: 'GENERAL.ADDRESS',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'locationAddressId',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'GENERAL.DISTRICT',
      filterable: true,
      sortable: true,
      data: {},
    },
    {
      dataField: 'managerName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.MANAGER',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'phoneNumber',
      columnType: ColumnType.Text,
      caption: 'GENERAL.PHONE_NUMBER',
      filterable: true,
      sortable: true,
    },
    // {
    //   dataField: 'status',
    //   columnType: ColumnType.Dropdown,
    //   caption: 'სტატუსი',
    //   filterable: false,
    //   sortable: false,
    //   data: {
    //     [LocationStatus.Draft]: 'დრაფტი',
    //     [LocationStatus.Enabled]: 'აქტიური',
    //     [LocationStatus.Disabled]: 'შეჩერებული',
    //     [LocationStatus.Deleted]: 'წაშლილი'
    //   }
    // }
  ];

  addressMap = new Map<number, string>();

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private storage: StorageService,
    private eventBus: EventBusService,
    private location: LocationService,
    private translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Locations');
  }

  protected get httpGetItems(): Observable<any> {
    let params = new HttpParams({
      fromObject: {
        ...this.currentState,
        status: `${LocationStatus.Enabled}`,
      },
    });
    const sortField = params.get('sortField');
    if (sortField === 'locationAddressId') {
      params = params.set('sortField', 'locationAddressName'); // required for lexicographical sorting of district names
    }
    return this.client
      .get('locations', {
        params,
      })
      .pipe(
        tap(() => this.fetchAddresIds()) // fetch addresses in case new one added as result of changes.
      );
  }

  fetchAddresIds(): void {
    this.client
      .get('locations/addresses-for-filter')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        console.log('dev => fetchAddresIds => res', res);
        if (res) {
          // this.addressMap.clear();
          (res as Array<{ id: number; districtName: string }>).forEach(
            (address) => {
              this.addressMap.set(address.id, address.districtName);
            }
          );
          this.updateAddressesForFilter(
            res as Array<{ id: number; districtName: string }>
          );
        }
      });
  }

  updateAddressesForFilter(
    addressData: Array<{ id: number; districtName: string }>
  ): void {
    // transform array into object
    this.displayedColumns[2].data = addressData.reduce(
      (accumulator, address) => {
        accumulator[address.id] = address.districtName;
        return accumulator;
      },
      {}
    );
    this.cdr.markForCheck();
  }

  addNewItem(): void {
    this.dialog
      .open(AddLocationModalComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
          this.eventBus.locationsUpdated();
        }
      });
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);
    this.dialog
      .open(AddLocationModalComponent, {
        width: '548px',
        panelClass: 'overflow-visible',
        data: id,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.requestItems.next();
          this.eventBus.locationsUpdated();
        }
      });
  }

  deleteAndRefreshItems(row?: any): void {
    const data =
      row && row.id
        ? { ids: [row.id] }
        : {
            ids: this.idsOfSelectedItems,
          };
    this.client
      .delete('locations', data)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.location.makeLocationsEmpty();
        this.eventBus.locationsUpdated();
        if (data.ids.some((id) => this.location.id === id)) {
          this.resetLocation();
          return;
        }

        this.notificator.saySuccess(
          this.translate.instant(
            'LOCATIONS.NOTIFICATION.RECORD_DELETE_SUCCESSFULLY'
          )
        );
        this.requestItems.next();
        this.eventBus.locationsUpdated();
      });
  }

  isRowDeletable(row): boolean {
    return row.canDelete;
  }

  get isAllDeletable(): boolean {
    return this.selectedRows.some((row) => !row.canDelete);
  }

  private resetLocation(): void {
    this.location.resetLocation();
    window.location.reload();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.fetchAddresIds();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
