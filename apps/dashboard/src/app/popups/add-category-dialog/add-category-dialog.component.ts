import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Observable, EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ClientService, RoutingStateService } from '@optimo/core';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { ErrorCode } from 'apps/dashboard/src/app/core/enums/error-codes.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { ECommandValidationErrorCode } from '../../core/enums/ECommandValidationErrorCode';
import { MixpanelService } from '@optimo/mixpanel';
import { NotificationsService } from '../../../../../admin-panel/src/app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-category-dialog',
  templateUrl: './add-category-dialog.component.html',
  styleUrls: ['./add-category-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCategoryDialogComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  fileUploadMode: boolean = false;
  editItem: any;
  private unsubscribe$ = new Subject<void>();
  duplicateCategoryNameError: boolean;
  requestIsSent: boolean;

  constructor(
    private dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService,
    private notificator: NotificationsService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private _mixpanelService: MixpanelService,
    private _routingState: RoutingStateService,
    private translateService: TranslateService
  ) {
    this._mixpanelService.trackPageView(
      this.data ? 'Edit Category' : 'Add Category'
    );
    this._routingState.tagHotjarEvent(this.data ? 'Edit Category' : 'Add Category');
  }

  ngOnInit(): void {
    if (this.data) {
      this.getEditData();
    } else {
      this.createForm();
    }
  }

  private createForm(): void {
    this.categoryForm = this.fb.group({
      name: [this.editItem && this.editItem.name, Validators.required],
      photoId: [this.editItem && this.editItem.photoId],
      // parentCategoryId: [this.editItem && this.editItem.parentCategoryId]
    });
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.categoryForm.dirty || this.fileUploadMode) {
    this.duplicateCategoryNameError = false;
    if (this.categoryForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    // const parentCategoryId = this.getValue('parentCategoryId');
    const data = {
      id: this.editItem && this.editItem.id,
      ...this.categoryForm.getRawValue(),
    };

    const request = this.data ? this.client.put : this.client.post;

    this.requestIsSent = true;
    request
      .bind(this.client)('stockitemcategories', data)
      .pipe(
        catchError((err) => {
          this.checkError(err);
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        this._mixpanelService.track(
          this.data ? 'Edit Category (Success)' : 'Add Category (Success)'
        );
        this.dialogRef.close((result && result.id) || true);
      });
    }else{
      this.markFormAsTouched();
      // this.dialogRef.close(false);
    }
  }
  private markFormAsTouched(){
    this.categoryForm.get('name').markAsTouched();
    this.categoryForm.get('name').updateValueAndValidity();
  }
  private checkError(err: HttpErrorResponse): void {
    this.requestIsSent = false;
    this.cdr.markForCheck();
    if (
      err.error.Errors?.DomainErrorCodes.includes(
        ECommandValidationErrorCode.DuplicatedCategoryName
      ) ||  err.error?.errorCode === ErrorCode.DuplicatedCategoryName
    ) {
      this.duplicateCategoryNameError = true;
      this.categoryForm.controls.name.setErrors({ duplicateName: true });
      this.notificator.sayError(this.translateService.instant('CATEGORIES')['ADDOREDITMODAL']['CATEGORY_ALREADY_EXISTS']);
      this.cdr.markForCheck();
    }
  }

  onCancel(): void {
    if (this.categoryForm.pristine) {
      this.dialogRef.close(false);
      return;
    }
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
      .subscribe((r) => {
        if (r) {
          this.dialogRef.close(false);
        }
      });
  }

  private getEditData(): void {
    this.getStockitemCategoryById(this.data)
      .pipe(
        catchError(() => {
          this.dialogRef.close();
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((result) => {
        if (result) {
          this.editItem = result;
          this.createForm();
        } else {
          this.dialogRef.close();
        }
      });
  }

  // getStockitemCategories = (state: any): Observable<any> => {
  //   let params = new HttpParams({
  //     fromObject: {
  //       sortField: 'name',
  //       sortOrder: 'ASC',
  //       pageIndex: state.pageIndex,
  //       pageSize: state.pageSize,
  //       status: CategoryStatuses.Enabled.toString()
  //     }
  //   });

  //   if (state.searchValue && state.searchValue !== '') {
  //     params = params.append('name', state.searchValue);
  //   }

  //   let request = this.client.getAuthed(
  //     'stockitemcategories',
  //     'inventory-service',
  //     null,
  //     params
  //   );
  //   if (this.editItem) {
  //     request = request.pipe(
  //       map(
  //         (res: any) =>
  //           (res.data = res.data.filter(c => c.id !== this.editItem.id))
  //       )
  //     );
  //   }
  //   return request;
  // }

  getStockitemCategoryById = (id: number): Observable<any> => {
    return this.client.get(`stockitemcategories/${id}`);
  };

  onPhotoUploaded(photoId: any): void {
    if (photoId) {
        this.fileUploadMode = true;
        this.categoryForm.controls.photoId.setValue(photoId);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
