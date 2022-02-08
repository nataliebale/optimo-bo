import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { mapValues, pickBy } from 'lodash-es';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { IStockItemAttribute } from '../../../models/IStockItemAttribute';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';
import { AddValuesComponent } from './add-values/add-values.component';
import { AddAttributeComponent } from './add/add-attribute.component';
import { approveAction, DialogData } from '@optimo/ui-popups-approve-dialog'

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributesComponent implements OnInit, OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  isLoading: boolean;
  curTableState: Partial<ITableState> = {};

  datasource: IStockItemAttribute[] = [];
  totalCount = 0;

  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: true,
      sortable: true,
      widthCoefficient: 1,
    },
    {
      dataField: 'categoryName',
      columnType: ColumnType.Text,
      caption: 'კატეგორია',
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
      dataField: 'custom-actions',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: 0.5,
    }
  ];

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private notificator: NotificationsService,
  ) {}

  ngOnInit(): void {
  }

  onTableStateChanged(newTableState: ITableState): void {
    console.log('attributes => tableStateChanged', newTableState);
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
        ...mapValues(pickBy(this.curTableState, value => value?.toString && value?.toString().trim() !== ''), val => val.toString())
      },
    });

    this.client
      .get<IChunkedResponse<IStockItemAttribute>>('stockitemattributes', { params })
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

  goToAdd() {
    this.dialog.open(
      AddAttributeComponent,
      {
        width: '548px',
        panelClass: 'overflow-visible',
      })
    .afterClosed()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(
      res => res && this.fetchItems(this.curTableState)
    )
    console.log('go to add attribute');
  }

  goToEdit(attribute: IStockItemAttribute) {
    this.dialog.open(
      AddAttributeComponent,
      {
        data: attribute,
        width: '548px',
        panelClass: 'overflow-visible',
      })
    .afterClosed()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(
      res => res && this.fetchItems(this.curTableState)
    )
    console.log('go to edit attribute');
  }

  goToAddValues(attribute: IStockItemAttribute) {
    this.dialog.open(
      AddValuesComponent,
      {
        data: attribute,
        width: '960px'
      }
    )
    // .afterClosed() nothing to update no effect
    // .pipe(
    //   takeUntil(this.unsubscribe$)
    // )
    // .subscribe(
    //   res => res && this.fetchItems(this.curTableState)
    // )
    console.log('go to add values');
  }

  deleteValue(attribute: IStockItemAttribute) {
    // console.log('dev => attributes.component => deleteValue',attribute);
    const dialogData: DialogData = {
      approveBtnLabel: 'წაშლა',
      denyBtnLabel: 'გაუქმება',
      title: 'ნამდვილად გსურს წაშლა?'
    }
    approveAction(this.dialog, dialogData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (res) => {
          if (res) {
            this.client.delete('stockitemattributes', {
              ids: [attribute.id],
            })
              .pipe(
                takeUntil(this.unsubscribe$),
                catchError(
                  (err) => {
                    console.log('err => remove attribute value', attribute, 'error', err);
                    this.notificator.sayError('ჩანაწერის წაშლა ვერ მოხერხდა');
                    return EMPTY;
                  }
                )
              )
              .subscribe(() => {
                this.notificator.saySuccess('ჩანაწერი წარმატებით წაიშალა');
                this.fetchItems(this.curTableState);
              });
          }
        }
      )
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
