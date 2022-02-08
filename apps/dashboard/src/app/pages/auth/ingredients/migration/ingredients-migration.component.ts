import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, Observable, EMPTY } from 'rxjs';
import { getUMOAcronym } from 'apps/dashboard/src/app/core/enums/measurement-units.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { StockItemStatuses } from 'apps/dashboard/src/app/core/enums/stockitem-status.enum';
import { StockItemType } from 'apps/dashboard/src/app/core/enums/stockitem-type.enum';
import { mapOfHoldingTypes } from 'apps/dashboard/src/app/core/enums/holding-type.enum';
import { catchError, takeUntil } from 'rxjs/operators';
import { CustomValidators } from 'apps/dashboard/src/app/core/helpers/validators/validators.helper';

@Component({
  selector: 'app-ingredients-migration',
  templateUrl: './ingredients-migration.component.html',
  styleUrls: ['./ingredients-migration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientsMigrationComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  form: FormGroup;
  mapOfHoldingTypes = mapOfHoldingTypes;
  supply = '0';
  getUMOAcronym = getUMOAcronym;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private notify: NotificationsService,
    private dialogRef: MatDialogRef<IngredientsMigrationComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      stockItemIdFrom: [null, [Validators.required]],
      stockItemIdTo: [null, [Validators.required]],
      holdingType: [null, Validators.required],
      quantity: [
        null,
        [Validators.required, CustomValidators.OnlyNumbersWithComma],
      ],
    });
  }

  onDecline(): void {
    this.dialogRef.close(false);
  }

  getStockitemsSupply(event: any): void {
    if (!event) {
      this.supply = '0';
      return;
    }
    this.supply = `${event.quantity} ${getUMOAcronym(event.unitOfMeasurement)}`;
  }

  onApprove(): void {
    let requestBody = this.form.getRawValue();
    this.client
      .post('stockitems/transfer', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.dialogRef.close(true);
          this.notify.saySuccess('პროდუქტი წარმატებით გადმოვიდა');
        } else {
          this.notify.sayError('პროდუქტის გადმოტანა ვერ მოხერხდა');
        }
      });
  }

  getStockitems = (state: any): Observable<any> => {
    return this._getStockitems(false, state);
  };

  getIngredients = (state: any): Observable<any> => {
    return this._getStockitems(true, state);
  };

  private _getStockitems(isIngredient: boolean, state: any): Observable<any> {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [StockItemStatuses.Enabled.toString(), StockItemStatuses.Disabled.toString()],
        stockItemType: isIngredient
          ? StockItemType.Ingredient.toString()
          : StockItemType.Product.toString(),
      },
    });
    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get('stockitems', { params });
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
