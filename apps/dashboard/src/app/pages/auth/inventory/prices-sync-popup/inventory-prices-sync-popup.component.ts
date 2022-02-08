import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { LocationStatus } from '../../../../core/enums/location-status.enum';
import { LocationService } from '../../../../core/services/location/location.service';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-inventory-prices-sync-popup',
  templateUrl: './inventory-prices-sync-popup.component.html',
  styleUrls: ['./inventory-prices-sync-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPricesSyncPopupComponent implements OnInit, OnDestroy {
  locations: any[];
  selectedLocationId: number;
  submited: boolean = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<InventoryPricesSyncPopupComponent>,
    private location: LocationService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Price Sync');
  }

  ngOnInit(): void {
    this.getLocations();
  }

  private getLocations(): void {
    this.client
      .get('locations', {
        params: new HttpParams({
          fromObject: {
            pageIndex: '0',
            sortField: 'id',
            sortOrder: 'ASC',
            pageSize: '20',
            status: LocationStatus.Enabled.toString(),
          },
        }),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ data }) => {
        this.locations = data.filter(
          (location) => location.id !== this.currentLocationId
        );
        this.cdr.markForCheck();
      });
  }

  onApprove(): void {
    this.submited = true;
    this.cdr.markForCheck();
    this.client
      .post('stockitems/prices/sync', {
        locationIdFrom: this.selectedLocationId,
        locationIdTo: this.currentLocationId,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this._mixpanelService.track('Add Price Bulk (Success)');
          this.dialogRef.close(true);
        },
        () => {
          this.dialogRef.close(false);
        }
      );
  }

  onDecline(): void {
    this.dialogRef.close();
  }

  private get currentLocationId(): number {
    return this.location.id;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
