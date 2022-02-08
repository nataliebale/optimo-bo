import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { ITableState } from '../../../../models/ITableState';
import { IChunkedResponse } from '../../../../models/response/IChunkedResponse';
import { mapValues, pickBy } from 'lodash-es';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { AddAttributeCategoryComponent } from './add-attribute-category/add-attribute-category.component';
import { IStockItemAttributeCategory } from '../../../../models/IStockItemAttributeCategory';
import { NotificationsService } from '../../../../core/services/notifications/notifications.service';
import { approveAction, DialogData } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-attribute-categories',
  templateUrl: './attribute-categories.component.html',
  styleUrls: ['./attribute-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class AttributeCategoriesComponent implements OnInit, OnDestroy{
  protected unsubscribe$ = new Subject<void>();

  isLoading: boolean;
  curTableState: Partial<ITableState> = {};

  datasource: IStockItemAttributeCategory[] = [];
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
      widthCoefficient: 0.25,
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
      .get<IChunkedResponse<IStockItemAttributeCategory>>('stockitemattributecategories', { params })
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
      AddAttributeCategoryComponent, {
        width: '548px'
        
      }
    )
    .afterClosed()
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(
      res => res && this.fetchItems(this.curTableState)
    )
    console.log('go to add attributeCategory');
  }

  deleteCategory(attributeCategory: IStockItemAttributeCategory) {
    // console.log('dev => attributes.component => deleteValue',attributeCategory);
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
            this.client.delete('stockitemattributecategories', {
              ids: [attributeCategory.id],
            })
              .pipe(
                takeUntil(this.unsubscribe$),
                catchError(
                  (err) => {
                    console.log('err => remove attribute value', attributeCategory, 'error', err);
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
      );
  }

  editCategory(category: IStockItemAttributeCategory) {
    this.dialog.open(
      AddAttributeCategoryComponent,
      {
        data: category,
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
    console.log('go to edit attribute category');
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
