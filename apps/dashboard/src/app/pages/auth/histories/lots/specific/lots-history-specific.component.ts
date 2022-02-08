import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339, startOfDay, endOfDay } from 'date-fns';
import { BaseListComponent } from '../../../base-list.component';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, Service } from '@optimo/core';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColumnData, ColumnType, TableComponent } from '@optimo/ui-table';
import { NumberColumnType } from '@optimo/ui-table';
import { firstUploadedProductsTypes } from '../../../../../core/enums/first-uploaded-products-records.enum';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lots-history-specific',
  templateUrl: './lots-history-specific.component.html',
  styleUrls: ['./lots-history-specific.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotsHistorySpecificComponent extends BaseListComponent
  implements OnInit {
  typesData = firstUploadedProductsTypes;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.SUPPLIER_NAME',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.TYPE',
      filterable: true,
      sortable: true,
      data: this.translateService.instant('LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.TYPES_DATA')
    },
    {
      dataField: 'receivedQuantity',
      columnType: ColumnType.Number,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.RECEIVED_QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitCost',
      columnType: ColumnType.Number,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.UNIT_COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.QUANTITY_ON_HAND',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'date',
      columnType: ColumnType.Date,
      caption: 'LOTS.SPECIFIC_LOTS.LIST.TABLE_COLUMNS.DATE',
      filterable: true,
      sortable: true,
    },
  ];

  stockItemId: number;
  private dateFrom: string;
  private dateTo: string;

  constructor(
    private client: ClientService,
    notificator: NotificationsService,
    cdr: ChangeDetectorRef,
    route: ActivatedRoute,
    dialog: MatDialog,
    router: Router,
    private translateService: TranslateService
  ) {
    super(notificator, cdr, route, dialog, router);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo, stockItemId }) => {
        if (stockItemId) {
          this.stockItemId = +stockItemId;
          this.cdr.markForCheck();
          this.dateFrom =
            dateFrom && formatRFC3339(startOfDay(new Date(dateFrom)));
          this.dateTo = dateTo && formatRFC3339(endOfDay(new Date(dateTo)));
          if (this.tableInstance) {
            this.tableInstance.loading = true;
            this.tableInstance.cdr.markForCheck();
          }
          this.requestItems.next();
        }
      });
  }

  onExport() {
    console.log('specificComponentTest');
  }

  protected get httpGetItems(): Observable<any> {
    if (!this.stockItemId) {
      return of({ totalCount: 0, data: [] });
    }

    return this.client.get('warehouse/stockitemholdinglotshistory', {
      service: Service.Reporting,
      params: new HttpParams({
        fromObject: {
          ...this.currentState,
          stockItemId: this.stockItemId.toString(),
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
        },
      }),
    });
  }
}
