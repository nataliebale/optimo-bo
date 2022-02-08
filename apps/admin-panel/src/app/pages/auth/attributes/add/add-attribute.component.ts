import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { IStockItemAttribute } from 'apps/admin-panel/src/app/models/IStockItemAttribute';

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddAttributeComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddAttributeComponent>,
    private fb: FormBuilder,
    private client: ClientService,
    private notificator: NotificationsService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) private editAttribute: IStockItemAttribute,
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: [this?.editAttribute?.name || '', Validators.required],
      categoryId: [this?.editAttribute?.categoryId || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return;
    }

    const request =
      this.editAttribute
        ? this.client.put('stockitemattributes', {
            id: this.editAttribute?.id,
            ...this.form.getRawValue()
          })
        : this.client.post('stockitemattributes', {
          ...this.form.getRawValue()
          });
    
    request
    .pipe(
      takeUntil(this.unsubscribe$),
      catchError((err) => {
        if (err?.error?.errorCode === 1) {
          this.notificator.sayError('მონაცემი ამ მნიშვნელობით უკვე არსებობს');
          if (this?.form?.controls?.name) this?.form?.controls?.name.setErrors({notUnique: true});
          this.cdr.markForCheck();
        }
        else {
          this.notificator.sayError('ჩანაწერის დამატება ვერ მოხერხდა');
        }
        return EMPTY;
      }),
    )
    .subscribe(
      () => {
        this.notificator.saySuccess('ჩანაწერი წარმატებით დაემატა');
        this.dismissDialog(true);
      }
    )
  }

  getAttributeCategories = (state: any): Observable<any> => {
    return this.client.get('stockitemattributecategories', {
      params: new HttpParams({
        fromObject: {
          ...(state.searchValue ?{name: state.searchValue} :{}),
          sortField: 'id',
          sortOrder: 'asc',
          pageIndex: state.pageIndex,
          pageSize: state.pageSize,
        }
      })
    })
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dismissDialog(shouldUpdate = false) {
    this.dialogRef.close(shouldUpdate);
  }

  get isEditMode() {
    return this?.editAttribute?.id;
  }

  getAttributeCategoryById = (id: number): Observable<any> => {
    return this.client.get<any>(`stockitemattributecategories/single?id=${id}`);
  };
}
