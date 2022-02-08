import { HttpParams } from '@angular/common/http';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { IStockItemAttributeValue } from '../../../../models/IStockItemAttributeValue';
import { IChunkedResponse } from '../../../../models/response/IChunkedResponse';
import { mapValues, pickBy } from 'lodash-es';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { IStockItemAttribute } from '../../../../models/IStockItemAttribute';
import { ITableState } from '../../../../models/ITableState';
import { FormControl, Validators } from '@angular/forms';
import { NotificationsService } from 'apps/admin-panel/src/app/core/services/notifications/notifications.service';
import { approveAction, DialogData } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-add-values',
  templateUrl: './add-values.component.html',
  styleUrls: ['./add-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddValuesComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  nameInputControl: FormControl;

  isLoading: boolean;
  curTableState: Partial<ITableState> = {};

  datasource: IStockItemAttributeValue[] = [];
  totalCount = 0;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'value',
      columnType: ColumnType.Text,
      caption: 'მნიშვნელობა',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'creationDate',
      columnType: ColumnType.Date,
      caption: 'შექმნის თარიღი',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: 0.5,
    },
  ];

  constructor(
    private dialogRef: MatDialogRef<AddValuesComponent>,
    @Inject(MAT_DIALOG_DATA) private attribute: IStockItemAttribute,
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private notificator: NotificationsService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.nameInputControl = new FormControl('', [Validators.required]);
  }

  onTableStateChanged(newTableState: ITableState): void {
    console.log('add-val => table state changed');
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    console.log('fetch with state', tableState);
    const params = new HttpParams({
      fromObject: {
        attributeId: this.attribute.id.toString(),

        ...mapValues(
          pickBy(
            this.curTableState,
            (value) => value?.toString && value?.toString().trim() !== ''
          ),
          (val) => val.toString()
        ),
      },
    });

    this.client
      .get<IChunkedResponse<IStockItemAttributeValue>>(
        'stockitemattributevalues',
        { params }
      )
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.datasource = data.data;
          this.totalCount = data.totalCount;
          this.cdr.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  addAttributeValue(): void {
    if (this.nameInputControl.invalid) {
      this.nameInputControl.markAllAsTouched();
      return;
    }

    this.client
      .post('stockitemattributevalues', {
        value: this.nameInputControl.value,
        attributeId: this.attribute.id,
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          if (err?.error?.errorCode === 1) {
            this.notificator.sayError(
              'მონაცემის ამ მნიშვნელობით უკვე არსებობს'
            );
            this.nameInputControl.setErrors({
              notUnique: true,
            });
            this.cdr.markForCheck();
          } else {
            console.log(err);
            this.notificator.sayError('ჩანაწერი დამატება ვერ მოხერხდა');
            return EMPTY;
          }
        })
      )
      .subscribe((res) => {
        if (res) {
          this.notificator.saySuccess('ჩანაწერი წარმატებით დაემატა');
          this.fetchItems(this.curTableState);
          this.nameInputControl.reset();
        }
      });
  }

  removeValue(attributeValue: IStockItemAttributeValue) {
    const dialogData: DialogData = {
      approveBtnLabel: 'წაშლა',
      denyBtnLabel: 'გაუქმება',
      title: 'ნამდვილად გსურს წაშლა?',
    };
    approveAction(this.dialog, dialogData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {
        if (res) {
          this.client
            .delete('stockitemattributevalues', {
              ids: [attributeValue.id],
            })
            .pipe(
              takeUntil(this.unsubscribe$),
              catchError((err) => {
                console.log(
                  'err => remove attribute value',
                  attributeValue,
                  'error',
                  err
                );
                this.notificator.sayError('ჩანაწერის წაშლა ვერ მოხერხდა');
                return EMPTY;
              })
            )
            .subscribe(() => {
              this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
              this.fetchItems(this.curTableState);
            });
        }
      });
  }

  dismissDialog(shouldUpdate = false) {
    this.dialogRef.close(shouldUpdate);
  }

  editValue($event: any, row: any) {
    $event?.stopPropagation();
    console.log('dev => editValue => row:', row);
    // setTimeout(() => { // required for click outside not to register click immediately
    row.editValue = new FormControl(row.value, [Validators.required]);
    this.cdr.markForCheck();
    // })
  }

  onSubmitValue(row: any) {
    console.log('dev => submitValue => row:', row);
    this.client
      .put('stockitemattributevalues', {
        ...row,
        value: row.editValue.value,
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((err) => {
          if (err?.error?.errorCode === 1) {
            this.notificator.sayError('მონაცემი ამ მნიშვნელობით უკვე არსებობს');
            if (row?.editValue)
              (row.editValue as FormControl).setErrors({ notUnique: true });
            this.cdr.markForCheck();
          } else {
            this.notificator.sayError('მონაცემის შენახვა ვერ მოხერხდა');
          }
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.notificator.saySuccess('მნიშვნელობა წარმატებით განახლდა');
        row.editValue = undefined;
        this.cdr.markForCheck();
        this.fetchItems(this.curTableState);
      });
  }

  onResetRowInput(row: any) {
    row.editValue = undefined;
    this.cdr.markForCheck();
  }
}
