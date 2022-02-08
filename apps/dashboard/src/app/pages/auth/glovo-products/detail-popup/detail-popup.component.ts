import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, NgModel } from '@angular/forms';
import { EMPTY, of, Subject } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService, RoutingStateService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { MixpanelService } from '@optimo/mixpanel';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './detail-popup.component.html',
  styleUrls: ['./detail-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailPopupComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;

  @ViewChild(DynamicSelectComponent, { static: true })
  dynamicSelector: DynamicSelectComponent;

  private unsubscribe$ = new Subject<void>();
  isSubmited: boolean;
  chosenStockitem: any;

  constructor(
    private dialogRef: MatDialogRef<DetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private notificator: NotificationsService,
    private _mixpanelService: MixpanelService,
    private _hjService: RoutingStateService,
    public translate: TranslateService
  ) {
    this._mixpanelService.track(
      this.itemId ? 'Edit Glovo Products' : 'Add Glovo Products'
    );
    this._hjService.trackHotjar(
      this.itemId ? 'Edit Glovo Products' : 'Add Glovo Products'
    );
  }

  ngOnInit(): void {
    if (this.itemId) {
      this.getItemForEdit();
    } else {
      this.createForm();
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      product: [
        {
          value: this.item && this.item.stockItemId,
          disabled: this.itemId,
        },
        [Validators.required],
      ],
      subCategoryId: [
        {
          value: this.item && this.item.stockItemSubCategoryId,
          disabled: !this.chosenStockitem && !this.itemId,
        },
        [Validators.required],
      ],
      category: [this.item && this.item.stockItemParentCategoryName],
    });
    this.cdr.markForCheck();
  }

  private getItemForEdit(): void {
    this.client
      .get(`glovo/stock-item/single?id=${this.itemId}`)
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        if (!result) {
          this.dialogRef.close();
        }
        this.item = result;
        this.createForm();
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmited = true;
    const formData = this.form.getRawValue();
    const requestBody = {
      stockItemId: formData.product,
      stockItemSubCategoryId: formData.subCategoryId,
    };

    if (this.itemId) {
      if (
        this.form.get('subCategoryId').value ===
        this.item.stockItemSubCategoryId
      ) {
        this.dialogRef.close(true);
        return;
      }
      this.client
        .put('glovo/stock-item', {
          id: this.itemId,
          ...requestBody,
        })
        .pipe(
          catchError((err) => {
            this.isSubmited = false;
            if (err && err.error && err.error.errorCode === 41) {
              this.notificator.sayError(
                this.translate.instant('GLOVO_PRODUCTS.ALREADY_EXISTS')
              );
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Edit Glovo Product (Success)');
          this.notificator.saySuccess(
            this.translate.instant('GLOVO_PRODUCTS.UPDATE_SUCCESSFULLY_MESSAGE')
          );
          this.dialogRef.close(true);
        });
    } else {
      this.client
        .post('glovo/stock-item', {
          ...requestBody,
        })
        .pipe(
          catchError((err) => {
            this.isSubmited = false;
            if (err && err.error && err.error.errorCode === 41) {
              this.notificator.saySuccess(
                this.translate.instant('GLOVO_PRODUCTS.ALREADY_EXISTS')
              );
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Add Glovo Product (Success)');

          this.notificator.saySuccess(
            this.translate.instant('GLOVO_PRODUCTS.ADDED_SUCCESSFULLY_MESSAGE')
          );
          this.dialogRef.close(true);
        });
    }
  }

  getValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  close(): void {
    this.dialogRef.close();
  }

  onCancel() {
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
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.close();
      });
  }

  getStockItems = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'stockItemName',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('stockItemName', state.searchValue);
    } else {
      params = params.append('stockItemName', '');
    }

    return this.client.get<any>('stockitems/by-name', { params });
  };

  getStockItemById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitems/${id}`);
  };

  getSubCategories = (state: any): Observable<any> => {
    if (!this.chosenStockitem) {
      return of({ data: [], totalCount: 0 });
    }
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    if (this.chosenStockitem) {
      params = params.append(
        'parentCategoryId',
        this.chosenStockitem.categoryId
      );
    }

    return this.client.get<any>(`stockitemcategories/simple`, { params });
  };

  getSubCategoryById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitemcategories/${id}`);
  };

  onChangeStockItem(data: any): void {
    this.chosenStockitem = data;
    if (data && !this.item) {
      this.form.controls.subCategoryId.enable();
      this.form.get('subCategoryId').setValue('');
      // if (this.dynamicSelector) this.dynamicSelector.reload();
      this.form.get('category').setValue(data.categoryName);
      this.cdr.markForCheck();
    }
  }

  get title(): string {
    return this.itemId
      ? 'GLOVO_PRODUCTS.EDIT_PRODUCTS'
      : 'GLOVO_PRODUCTS.ADD_PRODUCTS';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
