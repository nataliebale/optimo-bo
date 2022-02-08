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
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { formatNumber } from '@angular/common';
import { MixpanelService } from '@optimo/mixpanel';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';

@Component({
  selector: 'app-view-ingredient',
  templateUrl: './view-ingredient.component.html',
  styleUrls: ['./view-ingredient.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewIngredientComponent implements OnInit, OnDestroy {
  getUMOAcronym = getUMOAcronym;
  stockItem: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private notificator: NotificationsService,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewIngredientComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router,
    private _mixpanelService: MixpanelService,
    private _locationService: LocationService,
  ) {
    this._mixpanelService.track('View Ingredient');
  }

  ngOnInit(): void {
    this.getData();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {

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
                ? 'GENERAL.APPROVE_INGREDIENT_DELETE_MULTIPLE_LOCATIONS'
                : null,
            },
            hasMultipleLocations ? '575px' : '480px'
          )
        ),
        filter((approved) => approved),
        switchMap(() =>
          this.client.delete('stockitems', {
            stockItemIds: [this.stockItem.id],
          })
        ),
      )
      .subscribe((res) => {
        console.log('dev => itemsDeleted => res:', res);
        this.notificator.saySuccess(
          this.translate.instant('Ingredients')['Item']['deleteSuccessMessage']
        );
        this.dialogRef.close(true);
      });
  }

  onEdit(): void {
    console.log(
      'TCL: ViewIngredientComponent -> onEditttttttttttttt',
      this.stockItem.id
    );
    this.router.navigate(['/ingredients/edit', this.stockItem.id]).then(() => {
      this.close();
    });
  }

  private getData(): void {
    this.client
      .get(`stockitems/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((stockItem) => {
        this.stockItem = stockItem;

        console.log('stockitem', this.stockItem);

        this.rows = [
          {
            key: 'Ingredients.Item.Attributes.name',
            value: this.stockItem.name,
          },
          {
            key: 'Ingredients.Item.Attributes.categoryName',
            value: this.stockItem.categoryName,
          },
          {
            key: 'Ingredients.Item.Attributes.supplierNames',
            value: this.stockItem.supplierNames,
          },
          {
            key: 'Ingredients.Item.Attributes.barcode',
            value: this.stockItem.barcode,
          },
          {
            key: 'Ingredients.Item.Attributes.description',
            value: this.stockItem.description,
          },
          {
            key: 'Ingredients.Item.Attributes.unitOfMeasurement',
            value: `${this.stockItem.quantity.toFixed(4)} ${this.getUMOAcronym(
              this.stockItem.unitOfMeasurement
            )}`,
          },
          {
            key: 'Ingredients.Item.Attributes.unitCost',
            value: formatNumber(this.stockItem.unitCost, 'en', '1.4-4') + ' ₾',
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
