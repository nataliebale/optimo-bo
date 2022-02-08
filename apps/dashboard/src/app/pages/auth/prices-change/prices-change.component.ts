import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Inject,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { takeUntil } from 'rxjs/operators';
import {
  endOfDay,
  startOfDay,
  endOfToday,
  formatRFC3339,
  startOfToday,
} from 'date-fns';
import { PricesChangeListComponent } from './list/prices-change-list.component';
import {
  PricesChangeCriteria,
  MAP_OF_PRICES_CHANGE_CRITERIAS,
} from '../../../core/enums/prices-change-criteria.enum';
import {
  PricesChangeType,
  MAP_OF_PRICES_CHANGE_TYPES,
} from '../../../core/enums/prices-change-type.enum';
import { RoutingStateService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-prices-change',
  templateUrl: './prices-change.component.html',
  styleUrls: ['./prices-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricesChangeComponent implements OnInit, OnDestroy {
  @ViewChild(PricesChangeListComponent)
  pricesChangeListComponent: PricesChangeListComponent;

  form: FormGroup;
  changes: any;
  isSubmited: boolean;
  requestIsSent: boolean;
  dateFrom: Date;
  dateTo: Date;
  startOfToday = startOfToday();
  isDateFromPickerVisible: boolean;
  isDateToPickerVisible: boolean;
  mapOfPricesChangeTypes = MAP_OF_PRICES_CHANGE_TYPES;
  mapOfPricesChangeCriterias = MAP_OF_PRICES_CHANGE_CRITERIAS;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<PricesChangeComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Price Bulk Change');
  }

  ngOnInit(): void {
    this.createForm();
  }

  onToggleDateFromPicker(): void {
    this.isDateFromPickerVisible = !this.isDateFromPickerVisible;
  }

  onToggleDateToPicker(): void {
    this.isDateToPickerVisible = !this.isDateToPickerVisible;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      type: [null, [Validators.required]],
      criteria: [PricesChangeCriteria.Category, [Validators.required]],
      dateFrom: [null, [Validators.required]],
      dateTo: [{ value: null, disabled: true }],
    });
    this.cdr.markForCheck();
  }

  onSave(): void {
    console.log('TCL: EntitySalesDetailComponent -> this.form', this.form);
    this.isSubmited = true;
    if (this.isFormInvalid) {
      this.markFormGroupTouched();
      return;
    }

    const formRawValues = this.form.getRawValue();
    const isArray = Array.isArray(this.changes);

    console.log('bugs => changes:', this.changes);
    if (!isArray) {
      if (!(this?.changes?.quantity > 0 || this?.changes?.quantity < 0)) {
        console.log('not Implemented => no changes in Cat/Distr!');
        return;
      }
    } else {
      if (
        this.changes?.reduce(
          (
            accumulator: boolean,
            curItem: {
              id: number;
              priceChangeType: string;
              quantity: string | number;
            }
          ): boolean =>
            !(curItem?.quantity > 0 || curItem?.quantity < 0) && accumulator,
          true
        )
      ) {
        console.log(
          'not Implemented => one or more changes missing in prices!'
        );
        return;
      }
    }

    const requestBody = {
      priceType: formRawValues.type,
      validFrom: formatRFC3339(formRawValues.dateFrom),
      validTo: formRawValues.dateTo && formatRFC3339(formRawValues.dateTo),
      stockItems: isArray ? this.changes : null,
      category:
        formRawValues.criteria === PricesChangeCriteria.Category && !isArray
          ? this.changes
          : null,
      supplier:
        formRawValues.criteria === PricesChangeCriteria.Supplier && !isArray
          ? this.changes
          : null,
    };

    this.requestIsSent = true;

    this.cdr.markForCheck();
    this.client
      .post('stockitems/prices/bulk', requestBody)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this._mixpanelService.track('Add Price Bulk (Success)');
          this.close();
        },
        () => {
          this.requestIsSent = false;
          this.cdr.markForCheck();
        }
      );
  }

  onTypeChange(): void {
    const { dateTo } = this.form.controls;
    if (this.getValue('type') === PricesChangeType.Sale) {
      dateTo.enable();
      dateTo.setValidators(Validators.required);
    } else {
      dateTo.setValue(null);
      dateTo.disable();
      dateTo.clearValidators();
    }
    dateTo.updateValueAndValidity();
  }

  onCancel(): void {
    if (this.form.dirty) {
      this.showCancelDialog();
    } else {
      this.close();
    }
  }

  private showCancelDialog() {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'ნამდვილად გსურთ გაუქმება?',
          message: 'გაუქმების შემთხვევაში ცვლილებები არ შეინახება.',
          approveBtnLabel: 'კი',
          denyBtnLabel: 'არა',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.close();
        }
      });
  }

  private close(): void {
    this.bottomSheetRef.dismiss(
      this.routingState.getPreviousUrlTree() || '/inventory'
    );
  }

  private markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
    if (this.pricesChangeListComponent) {
      this.pricesChangeListComponent.markFormGroupTouched();
    }
  }

  get criteriasTitle(): string {
    switch (this.getValue('criteria')) {
      case PricesChangeCriteria.Category:
        return 'კატეგორიის';
      case PricesChangeCriteria.StockItem:
        return 'პროდუქტის';
      case PricesChangeCriteria.Supplier:
        return 'მომწოდებლის';
    }
  }

  get isFormInvalid(): boolean {
    return this.form.invalid || !this.changes;
  }

  onDateFromChange(date: Date): void {
    if (date) {
      if (date <= endOfToday()) {
        date = new Date();
      } else {
        date = startOfDay(date);
      }
    }
    this.dateFrom = date;
    this.setValue('dateFrom', date);
  }

  onDateToChange(date: Date): void {
    if (date) {
      date = endOfDay(date);
    }
    this.dateTo = date;
    this.setValue('dateTo', date);
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  private setValue(controlName: string, value: any): void {
    this.form.controls[controlName].setValue(value);
    this.form.controls[controlName].markAsDirty();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  // =======
  //   @ViewChild(PricesChangeListComponent)
  //   pricesChangeListComponent: PricesChangeListComponent;

  //   form: FormGroup;
  //   changes: any;
  //   isSubmited: boolean;
  //   requestIsSent: boolean;
  //   dateFrom: Date;
  //   dateTo: Date;
  //   startOfToday = startOfToday();
  //   isDateFromPickerVisible: boolean;
  //   isDateToPickerVisible: boolean;
  //   mapOfPricesChangeTypes = MAP_OF_PRICES_CHANGE_TYPES;
  //   mapOfPricesChangeCriterias = MAP_OF_PRICES_CHANGE_CRITERIAS;
  //   private unsubscribe$ = new Subject<void>();

  //   constructor(
  //     private bottomSheetRef: MatBottomSheetRef<PricesChangeComponent>,
  //     @Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
  //     private formBuilder: FormBuilder,
  //     public dialog: MatDialog,
  //     private client: ClientService,
  //     private cdr: ChangeDetectorRef,
  //     private routingState: RoutingStateService
  //   ) {}

  //   ngOnInit(): void {
  //     this.createForm();
  //   }

  //   private createForm(): void {
  //     this.form = this.formBuilder.group({
  //       type: [null, [Validators.required]],
  //       criteria: [PricesChangeCriteria.Category, [Validators.required]],
  //       dateFrom: [null, [Validators.required]],
  //       dateTo: [{ value: null, disabled: true }],
  //     });
  //     this.cdr.markForCheck();
  //   }

  //   onSave(): void {
  //     console.log('TCL: EntitySalesDetailComponent -> this.form', this.form);
  //     this.isSubmited = true;
  //     if (this.isFormInvalid) {
  //       this.markFormGroupTouched();
  //       return;
  //     }

  //     const formRawValues = this.form.getRawValue();
  //     const isArray = Array.isArray(this.changes);

  //     console.log('bugs => changes:', this.changes);
  //     if (!isArray) {
  //       if (!(this?.changes?.quantity > 0 || this?.changes?.quantity < 0)){
  //         console.log('not Implemented => no changes in Cat/Distr!');
  //         return;
  //       }
  //     }
  //     else {
  //       if (this.changes?.reduce((accumulator: boolean, curItem:{id: number; priceChangeType: string; quantity: string | number;}): boolean =>
  //         !(curItem?.quantity > 0 || curItem?.quantity < 0) && accumulator, true)
  //       ) {
  //         console.log('not Implemented => one or more changes missing in prices!');
  //         return;
  //       }
  //     }

  //     const requestBody = {
  //       priceType: formRawValues.type,
  //       validFrom: formatRFC3339(formRawValues.dateFrom),
  //       validTo: formRawValues.dateTo && formatRFC3339(formRawValues.dateTo),
  //       stockItems: isArray ? this.changes : null,
  //       category:
  //         formRawValues.criteria === PricesChangeCriteria.Category && !isArray
  //           ? this.changes
  //           : null,
  //       supplier:
  //         formRawValues.criteria === PricesChangeCriteria.Supplier && !isArray
  //           ? this.changes
  //           : null,
  //     };

  //     this.requestIsSent = true;

  //     this.cdr.markForCheck();
  //     this.client
  //       .post('stockitems/prices/bulk', requestBody)
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe(
  //         () => this.close(),
  //         () => {
  //         this.requestIsSent = false;
  //         this.cdr.markForCheck();
  //       });
  //   }

  //   onTypeChange(): void {
  //     const { dateTo } = this.form.controls;
  //     if (this.getValue('type') === PricesChangeType.Sale) {
  //       dateTo.enable();
  //       dateTo.setValidators(Validators.required);
  //     } else {
  //       dateTo.setValue(null);
  //       dateTo.disable();
  //       dateTo.clearValidators();
  //     }
  //     dateTo.updateValueAndValidity();
  //   }

  //   onCancel(): void {
  //     if (this.form.dirty) {
  //       this.showCancelDialog();
  //     } else {
  //       this.close();
  //     }
  //   }

  //   private showCancelDialog() {
  //     this.dialog
  //       .open(ApproveDialogComponent, {
  //         width: '548px',
  //         data: {
  //           title: 'ნამდვილად გსურთ გაუქმება?',
  //           message: 'გაუქმების შემთხვევაში ცვლილებები არ შეინახება.',
  //           approveBtnLabel: 'კი',
  //           denyBtnLabel: 'არა',
  //         },
  //       })
  //       .afterClosed()
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe((result) => {
  //         if (result) {
  //           this.close();
  //         }
  //       });
  //   }

  //   private close(): void {
  //     this.bottomSheetRef.dismiss(
  //       this.routingState.getPreviousUrlTree() || '/inventory'
  //     );
  //   }

  //   private markFormGroupTouched(): void {
  //     Object.values(this.form.controls).forEach((control) => {
  //       control.markAsTouched();
  //     });
  //     if (this.pricesChangeListComponent) {
  //       this.pricesChangeListComponent.markFormGroupTouched();
  //     }
  //   }

  //   get criteriasTitle(): string {
  //     switch (this.getValue('criteria')) {
  //       case PricesChangeCriteria.Category:
  //         return 'კატეგორიის';
  //       case PricesChangeCriteria.StockItem:
  //         return 'პროდუქტის';
  //       case PricesChangeCriteria.Supplier:
  //         return 'მომწოდებლის';
  //     }
  //   }

  //   get isFormInvalid(): boolean {
  //     return this.form.invalid || !this.changes;
  //   }

  //   onDateFromChange(date: Date): void {
  //     console.log('bugs => onDateFromChange', date);
  //     if (date) {
  //       if (date <= endOfToday()) {
  //         date = new Date();
  //       } else {
  //         date = startOfDay(date);
  //       }
  //     }
  //     this.dateFrom = date;
  //     this.setValue('dateFrom', date);
  //     this.onToggleDateFromPicker();
  //   }

  //   onDateToChange(date: Date): void {
  //     if (date) {
  //       date = endOfDay(date);
  //     }
  //     this.dateTo = date;
  //     this.setValue('dateTo', date);
  //     this.onToggleDateToPicker();
  //   }

  //   onToggleDateFromPicker(): void {
  //     this.isDateFromPickerVisible = !this.isDateFromPickerVisible;
  //     if (this.isDateFromPickerVisible) {
  //       this.isDateToPickerVisible = false;
  //     }
  //     this.cdr.markForCheck();
  //   }

  //   onToggleDateToPicker(): void {
  //     this.isDateToPickerVisible = !this.isDateToPickerVisible;
  //     if (this.isDateToPickerVisible) {
  //       this.isDateFromPickerVisible = false;
  //     }
  //     this.cdr.markForCheck();
  //   }

  //   getValue(controlName: string): any {
  //     return this.form.controls[controlName].value;
  //   }

  //   private setValue(controlName: string, value: any): void {
  //     this.form.controls[controlName].setValue(value);
  //     this.form.controls[controlName].markAsDirty();
  //   }

  //   ngOnDestroy(): void {
  //     this.unsubscribe$.next();
  //     this.unsubscribe$.complete();
  //   }
  // >>>>>>> develop
}
