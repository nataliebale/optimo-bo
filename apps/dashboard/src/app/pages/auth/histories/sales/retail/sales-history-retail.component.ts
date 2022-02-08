import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BaseListComponent } from '../../../base-list.component';
import {
  ColumnData,
  ColumnType,
  NumberColumnType,
  TableComponent,
} from '@optimo/ui-table';
import { ClientService, Service } from '@optimo/core';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { formatRFC3339, startOfDay, endOfDay } from 'date-fns';
import { takeUntil, map } from 'rxjs/operators';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { pickBy } from 'lodash-es';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { mapOfVATTypes } from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-sales-history-retail',
  templateUrl: './sales-history-retail.component.html',
  styleUrls: ['./sales-history-retail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesHistoryRetailComponent extends BaseListComponent
  implements OnInit {
  public textIsTruncated = textIsTruncated;
  @ViewChild('tableInstance') tableInstance: TableComponent;
  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.NAME_SLASH_BARCODE',
      filterable: true,
      sortable: true,
      canNotChangeVisibility: true,
      widthCoefficient: 1.5,
    },
    // {
    //   dataField: 'stockItemBarcode',
    //   columnType: ColumnType.Text,
    //   caption: 'ბარკოდი',
    //   filterable: true,
    //   sortable: true,
    //   canNotChangeVisibility: true,
    // },
    {
      dataField: 'suppliers',
      columnType: ColumnType.Text,
      caption: 'GENERAL.DISTRIBUTOR',
      filterable: true,
      sortable: false,
      canNotChangeVisibility: true,
      widthCoefficient: 1.5,
    },
    {
      dataField: 'stockItemCategoryName',
      columnType: ColumnType.Text,
      caption: 'GENERAL.CATEGORY',
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'quantitySold',
      columnType: ColumnType.Number,
      caption: 'GENERAL.QUANTITY',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'unitOfMeasurement',
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitExpense',
      columnType: ColumnType.Number,
      caption: 'SalesHistory.unitExpense',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'unitRevenue',
      columnType: ColumnType.Number,
      caption: 'SalesHistory.unitRevenue',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalRevenue',
      columnType: ColumnType.Number,
      caption: 'SalesHistory.totalRevenue',
      data: { type: NumberColumnType.Currency, digitsAfterDot: 4 },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalVATRate',
      columnType: ColumnType.Number,
      caption: 'SalesHistory.totalVATRate',
      data: {
        type: NumberColumnType.Currency,
        isHeaderRight: false,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      caption: 'GENERAL.MARGIN',
      data: {
        type: NumberColumnType.Currency,
      },
      filterable: true,
      sortable: true,
      hidden: true,
    },
    {
      dataField: 'vatRateType',
      columnType: ColumnType.DropdownMultiselect,
      caption: 'GENERAL.VAT_TYPE',
      filterable: true,
      sortable: false,
      data: mapOfVATTypes,
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
    private _mixpanelService: MixpanelService
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

  protected get httpGetItems(): Observable<any> {
    return this.client.get('sales/salehistory', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  // colled from parent
  public onExport(): void {
    this._mixpanelService.track('B2C Sales Export');
    this.client
      .get('sales/salehistory/excel', {
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
          saleOrderDateFrom: formatRFC3339(new Date(this.dateFrom)),
          saleOrderDateTo: formatRFC3339(new Date(this.dateTo)),
          ...state,
          stockItemBarcodeOrName: stockItemName as string,
        },
        (val) => val || (val as any) === 0
      ),
    })
      .append('status', '5')
      .append('status', '55');
  }

  getSuppliersName(suppliers: any[]): string {
    return suppliers && suppliers.map((s) => s.name).join(', \n');
  }

  getShortSuppliersName(suppliers: any[]): string {
    let name = suppliers && suppliers[0].name;
    if (suppliers.length > 1) {
      name += ', ';
    }
    return name;
  }
}
