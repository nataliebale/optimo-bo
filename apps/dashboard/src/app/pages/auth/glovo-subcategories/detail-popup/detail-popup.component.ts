import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ClientService, RoutingStateService } from '@optimo/core';
import { catchError, takeUntil } from 'rxjs/operators';
import { formatRFC3339 } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { MixpanelService } from '@optimo/mixpanel';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-detail-popup',
  templateUrl: './detail-popup.component.html',
  styleUrls: ['./detail-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailPopupComponent implements OnInit, OnDestroy {
  form: FormGroup;
  item: any;

  private unsubscribe$ = new Subject<void>();
  isSubmited: boolean;

  constructor(
    private dialogRef: MatDialogRef<DetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private notificator: NotificationsService,
    private _mixpanelService: MixpanelService,
    public translate: TranslateService,
    private _hjService: RoutingStateService
  ) {
    this._mixpanelService.track(
      this.itemId ? 'Edit Glovo Subcategory' : 'Add Glovo Subcategory'
    );
    this._hjService.trackHotjar(
      this.itemId ? 'Edit Glovo Subcategory' : 'Add Glovo Subcategory'
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
      parentCategoryId: [
        {
          value: this.item && this.item.parentCategoryId,
          disabled: this.item && this.itemId,
        },
        [Validators.required],
      ],

      name: [this.item && this.item.name, [Validators.required]],
    });
    this.cdr.markForCheck();
  }

  private getItemForEdit(): void {
    this.client
      .get(`stockitemcategories/${this.itemId}`)
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
      ...formData,
      transactionDate: formatRFC3339(Date.now()),
    };

    if (this.itemId) {
      this.client
        .put('stockitemcategories', {
          id: this.itemId,
          ...requestBody,
        })
        .pipe(
          catchError((err) => {
            this.isSubmited = false;
            if (err && err.error && err.error.errorCode === 41) {
              this.notificator.saySuccess(
                this.translate.instant('GLOVO_SUBCATEGORIES.ALREADY_EXISTS')
              );
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Edit Glovo Subcategory (Success)');
          this.notificator.saySuccess(
            this.translate.instant(
              'GLOVO_SUBCATEGORIES.UPDATE_SUCCESSFULLY_MESSAGE'
            )
          );
          this.dialogRef.close(true);
        });
    } else {
      this.client
        .post('stockitemcategories', {
          ...requestBody,
        })
        .pipe(
          catchError((err) => {
            this.isSubmited = false;
            if (err && err.error && err.error.errorCode === 41) {
              this.notificator.saySuccess(
                this.translate.instant('GLOVO_SUBCATEGORIES.ALREADY_EXISTS')
              );
            }
            return EMPTY;
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe(() => {
          this._mixpanelService.track('Add Glovo Subcategory (Success)');
          this.notificator.saySuccess(
            this.translate.instant(
              'GLOVO_SUBCATEGORIES.ADDED_SUCCESSFULLY_MESSAGE'
            )
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

  getCategories = (state: any): Observable<any> => {
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

    return this.client.get<any>('stockitemcategories/simple', { params });
  };

  getCategoryById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitemcategories/${id}`);
  };

  get title(): string {
    return this.itemId
      ? 'GLOVO_SUBCATEGORIES.EDIT_SUBCATEGORY'
      : 'GLOVO_SUBCATEGORIES.ADD_SUBCATEGORY';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
