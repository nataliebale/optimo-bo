import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { approveAction, ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { takeUntil, filter, switchMap, tap, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { formatNumber } from '@angular/common';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from '../../../../core/services/location/location.service';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-inventory-item',
  templateUrl: './view-inventory-item.component.html',
  styleUrls: ['./view-inventory-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInventoryItemComponent implements OnInit, OnDestroy {
  stockItem: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    protected notificator: NotificationsService,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<ViewInventoryItemComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router,
    private _mixpanelService: MixpanelService,
    private locationService: LocationService,
  ) {
    	this._mixpanelService.track('View Product');
  }

  ngOnInit(): void {
    this.getData();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.locationService.getLocations()
      .pipe(
        tap(locations => console.log('dev => locations =>', locations)),
        takeUntil(this.unsubscribe$),
        map(locations => locations.length > 1 ? true : false), // if hasMultipleLocations true else false
        switchMap((hasMultipleLocations: boolean) => approveAction(
          this.dialog,
          {
            title: "GENERAL.APPROVE_DELETE",
            message: hasMultipleLocations ? "GENERAL.APPROVE_STOCKITEM_DELETE_MULTIPLE_LOCATIONS" : null,
          },
          hasMultipleLocations ? '575px' : '480px',
        )),
        filter(approved => approved),
        switchMap(() => this.client.delete('stockitems', {
          stockItemIds: [this.stockItem.id],
        }))
      )
      .subscribe(() => {
        this.notificator.saySuccess( this.translate.instant('INVENTORY.PRODUCT_DELETE_SUCCESS')  );
        this.dialogRef.close(true);
      });

    // this.dialog // old version
    //   .open(ApproveDialogComponent, {
    //     width: '548px',
    //     data: {
    //       // message: `ნამდვილად გსურს ${this.stockItem.name} წაშლა?`,
    //       title: 'GENERAL.APPROVE_DELETE',
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(
    //     filter((r) => r),
    //     switchMap(() =>
    //       this.client.delete('stockitems', {
    //         stockItemIds: [this.stockItem.id],
    //       })
    //     ),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe(() => {
    //     this.dialogRef.close(true);
    //   });
  }

  onEdit(): void {
    console.log('TCL: ViewInventoryItemComponent -> onEditttttttttttttt');
    this.router.navigate(['/inventory/edit', this.stockItem.id]).then(() => {
      this.close();
    });
  }

  private getData(): void {
    this.client
      .get(`stockitems/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((stockItem) => {
        this.stockItem = stockItem;

        this.rows = [
          {
            key: 'GENERAL.NAME_2',
            value: this.stockItem.name,
          },
          {
            key: 'GENERAL.CATEGORY',
            value: this.stockItem.categoryName,
          },
          {
            key: 'GENERAL.BARCODE',
            value: this.stockItem.barcode,
          },
          {
            key: 'GENERAL.DESCRIPTION',
            value: this.stockItem.description,
          },
          {
            key: 'GENERAL.QUANTITY_IN_STOCK',
            value: this.stockItem.quantity,
          },
          {
            key: 'INVENTORY.UNIT_COST_SHORT',
            value: formatNumber(this.stockItem.unitCost, 'en', '1.4-4'),
          },
          {
            key: 'GENERAL.UNIT_PRICE',
            value: formatNumber(this.stockItem.unitPrice, 'en', '1.4-4'),
          },
        ];

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
