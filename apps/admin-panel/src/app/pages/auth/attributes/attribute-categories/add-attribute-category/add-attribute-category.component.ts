import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../../../core/services/notifications/notifications.service';
import { EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IStockItemAttributeCategory } from '../../../../../models/IStockItemAttributeCategory';

@Component({
  selector: 'app-add-attribute-category',
  templateUrl: './add-attribute-category.component.html',
  styleUrls: ['./add-attribute-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddAttributeCategoryComponent implements OnInit, OnDestroy{
  private unsubscribe$ = new Subject<void>();

  categoryName: FormControl;

  constructor(
    private dialogRef: MatDialogRef<AddAttributeCategoryComponent>,
    private client: ClientService,
    private notificator: NotificationsService,
    @Inject(MAT_DIALOG_DATA) private editAttributeCategory: IStockItemAttributeCategory,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.categoryName = new FormControl(
      this.editAttributeCategory?.name || '', [Validators.required]
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(): void {
    console.log('addAttributeCategory => submit', this.categoryName);
    if (this.categoryName.invalid) {
      this.categoryName.markAllAsTouched();
      return;
    }

    const request = this?.editAttributeCategory?.id
      ? this.client.put('stockitemattributecategories', {
          id: this.editAttributeCategory.id,
          name: this.categoryName.value,
        })
      : this.client.post('stockitemattributecategories', {
          name: this.categoryName.value,
        })

    request.pipe(
      takeUntil(this.unsubscribe$),
      catchError((err) => {
        if (err.error?.errorCode === 1) {
          this.categoryName.setErrors({notUnique: true});
          this.cdr.markForCheck();
          this.notificator.sayError('მონაცემი ამ მნიშვნელობით უკვე არსებობს');
        } else {
          console.log(err);
          this.notificator.sayError('ჩანაწერის დამატება ვერ მოხერხდა');
        }
        return EMPTY;
      }),
    )
    .subscribe(
      () => {
        this.dialogRef.close(true);
        this.notificator.saySuccess('ჩანაწერი წარმატებით დაემატა');
      }
    )
  }

  dismissDialog(shouldUpdate = false) {
    this.dialogRef.close(shouldUpdate);
  }

  get isEditMode() {
    return this?.editAttributeCategory?.id;
  }

}
