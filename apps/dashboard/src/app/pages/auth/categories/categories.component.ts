import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, StorageService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';
import { ColumnData, ColumnType, NumberColumnType } from '@optimo/ui-table';
import { ItemStatus } from 'apps/dashboard/src/app/core/enums/item-status.enum';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { AddCategoryDialogComponent } from 'apps/dashboard/src/app/popups/add-category-dialog/add-category-dialog.component';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseListComponent } from '../base-list.component';

export interface CategoriesEditPayload {
  id: number;
  photoId: string;
  name: string;
  description: string;
  parentCategoryId: number;
}
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent extends BaseListComponent {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'name',
      columnType: ColumnType.Text,
      caption: 'CATEGORIES.LIST.TABLECOLUMNS.TITLE',
      filterable: true,
      sortable: true,
      widthCoefficient: 2,
    },
    {
      dataField: 'totalQuantityOnHand',
      columnType: ColumnType.Number,
      caption: 'CATEGORIES.LIST.TABLECOLUMNS.TOTALUNITS',
      data: { type: NumberColumnType.Decimal },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalCost',
      columnType: ColumnType.Number,
      caption: 'CATEGORIES.LIST.TABLECOLUMNS.TOTALCOST',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'stockItemsCount',
      columnType: ColumnType.Number,
      caption: 'CATEGORIES.LIST.TABLECOLUMNS.ASSORTMENT',
      data: {
        type: NumberColumnType.FullNumber,
      },
      filterable: true,
      sortable: true,
    },
    // {
    //   dataField: 'id',
    //   columnType: ColumnType.Text,
    //   caption: '',
    //   filterable: false,
    //   sortable: false,
    //   widthCoefficient: 1.1,
    // },
  ];

  private _ItemStatus = ItemStatus;
  public isHorecaMode = this._storageService.isHorecaMode;
  constructor(
    private client: ClientService,
    private _storageService: StorageService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private _mixpanelService: MixpanelService
  ) {
    super(notificator, cdr, route, dialog, router);
    this._mixpanelService.track('Categories');
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('stockitemcategories', {
      params: new HttpParams({
        fromObject: {
          ...this.currentState,
          status: [
            this._ItemStatus.Disabled.toString(),
            this._ItemStatus.Enabled.toString(),
          ],
        },
      }),
    });
  }

  addNewItem(): void {
    this.dialog
      .open(AddCategoryDialogComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.notificator.saySuccess('კატეგორია წარმატებით დაემატა');
          this.requestItems.next();
        }
      });
  }

  showHide(row: any): void {
    if (row.categoryStatus === ItemStatus.Disabled) {
      return;
    }
    const status: ItemStatus = row.status;
    const id: number = row.id;
    const payload = {
      status:
        status === this._ItemStatus.Disabled
          ? this._ItemStatus.Enabled
          : this._ItemStatus.Disabled,
      id,
    };
    this.client
      .put<any>('stockitemcategories/status', payload)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.requestItems.next();
      });
  }

  goToEdit(row?: any): void {
    const id =
      (row && row.id) ||
      (this.selectedRows && this.selectedRows[0] && this.selectedRows[0].id);

    this.dialog
      .open(AddCategoryDialogComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
        data: id,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.notificator.saySuccess('კატეგორია წარმატებით განახლდა');
          this.requestItems.next();
        }
      });
  }

  protected requestDeleteItems(row?: any): Observable<any> {
    const data =
      row && row.id
        ? {
            ids: [row.id],
          }
        : {
            ids: this.idsOfSelectedItems,
          };
    return this.client.delete('stockitemcategories', data);
  }

  goToStatistics(): void {
    if (this.selectedRows && this.selectedRows.length === 1) {
      this.router.navigate(['/statistics/category'], {
        queryParams: { categoryId: this.selectedRows[0].id },
      });
    }
  }
}
