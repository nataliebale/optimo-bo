import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339, endOfDay, startOfDay } from 'date-fns';
import { BaseListComponent } from '../../base-list.component';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, Service } from '@optimo/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColumnData, ColumnType } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';

@Component({
  selector: 'app-popular-products-income',
  templateUrl: './popular-products-income.component.html',
  styleUrls: ['./popular-products-income.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularProductsIncomeComponent extends BaseListComponent
  implements OnInit {
  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: false,
      widthCoefficient: 2,
    },
    {
      dataField: 'quantitySold',
      columnType: ColumnType.Number,
      caption: 'გაყიდვები',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      caption: 'ფასნამატი',
      data: { type: NumberColumnType.Decimal },
      filterable: false,
      sortable: false,
      widthCoefficient: 1,
    },
    {
      dataField: 'id',
      columnType: ColumnType.Text,
      caption: '',
      filterable: false,
      sortable: false,
      widthCoefficient: 2.5,
    },
  ];

  private dateFrom: string;
  private dateTo: string;

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router
  ) {
    super(notificator, cdr, route, dialog, router);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo }) => {
        this.dateFrom =
          dateFrom && formatRFC3339(startOfDay(new Date(dateFrom)));
        this.dateTo = dateTo && formatRFC3339(endOfDay(new Date(dateTo)));
        this.requestItems.next();
      });
  }

  protected get httpGetItems(): Observable<any> {
    return this.client.get('warehouse/dashboard/popularstockitemsbyincome', {
      service: Service.Reporting,
      params: new HttpParams({
        fromObject: {
          ...this.currentState,
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
        },
      }),
    });
  }
}
