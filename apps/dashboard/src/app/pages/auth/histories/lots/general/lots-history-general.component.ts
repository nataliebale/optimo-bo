import { FileDownloadHelper } from '../../../../../core/helpers/file-download/file-download.helper.ts';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { formatRFC3339, endOfDay, startOfDay } from 'date-fns';
import { BaseListComponent } from '../../../base-list.component';
import { NotificationsService } from '../../../../../core/services/notifications/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientService, Service } from '@optimo/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import {
  ColumnData,
  ColumnType,
  NumberColumnType,
  TableComponent,
} from '@optimo/ui-table';
import { pickBy } from 'lodash-es';
import { textIsTruncated } from '@optimo/util/text-is-truncated';
import { firstUploadedProductsTypes } from '../../../../../core/enums/first-uploaded-products-records.enum';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-lots-history-general',
  templateUrl: './lots-history-general.component.html',
  styleUrls: ['./lots-history-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LotsHistoryGeneralComponent extends BaseListComponent
  implements OnInit {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  typesData = firstUploadedProductsTypes;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'supplierName',
      columnType: ColumnType.Text,
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.SUPPLIER_NAME',
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'type',
      columnType: ColumnType.Dropdown,
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.TYPE',
      filterable: true,
      sortable: true,
      data: this.translateService.instant('LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.TYPES_DATA')
    },
    {
      dataField: 'receivedQuantity',
      columnType: ColumnType.Number,
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.RECEIVED_QUANTITY',
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
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.UNIT_COST',
      data: { type: NumberColumnType.Decimal, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'quantityOnHand',
      columnType: ColumnType.Number,
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.QUANTITY_ON_HAND',
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
      caption: 'LOTS.GENERAL_LOTS.LIST.TABLE_COLUMNS.DATE',
      filterable: false,
      sortable: true,
    },
  ];

  private dateFrom: string;
  private dateTo: string;


  constructor(
    private client: ClientService,
    private fileDownloadHelper: FileDownloadHelper,
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
      .subscribe(({ dateFrom, dateTo }) => {
        this.dateFrom =
          dateFrom && formatRFC3339(startOfDay(new Date(dateFrom)));
        this.dateTo = dateTo && formatRFC3339(endOfDay(new Date(dateTo)));
        if (this.tableInstance) {
          this.tableInstance.loading = true;
          this.tableInstance.cdr.markForCheck();
        }
        this.requestItems.next();
      });
  }

  public onExport(): void {
    console.log('onExport -> this.requestBody', this.requestBody);
    this.client
      .get('warehouse/stockholdinglotshistory/excel', {
        service: Service.Reporting,
        params: this.requestBody,
        responseType: 'blob',
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response: HttpResponse<Blob>) => {
        this.fileDownloadHelper.downloadFromResponse(
          response,
          'application/ms-excel'
        );
      });
  }

  private get requestBody(): HttpParams {
    const { stockItemName, ...state } = this.currentState;

    return new HttpParams({
      fromObject: pickBy(
        {
          ...state,
          stockItemBarcodeOrName: stockItemName as string,
          dateFrom: this.dateFrom,
          dateTo: this.dateTo,
        },
        (val) => val || (val as any) === 0
      ),
    });
  }

  protected get httpGetItems(): Observable<any> {
    const { stockItemName, ...state } = this.currentState;
    return this.client.get('warehouse/stockholdinglotshistory', {
      service: Service.Reporting,
      params: new HttpParams({
        fromObject: pickBy(
          {
            ...state,
            stockItemBarcodeOrName: stockItemName as string,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
          },
          (val) => val || (val as any) === 0
        ),
      }),
    });
  }
}
