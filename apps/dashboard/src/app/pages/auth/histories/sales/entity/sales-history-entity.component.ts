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
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
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
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';
import { entitySaleStatusMap } from 'apps/dashboard/src/app/core/enums/entity-sale-status.enum';
import { mapOfEntitySaleOrderPaymentMethods } from 'apps/dashboard/src/app/core/enums/payment-methods.enum';
import { textIsTruncated } from 'libs/util/text-is-truncated/src/index';
import { mapOfVATTypes } from 'apps/dashboard/src/app/core/enums/VAT.enum';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-sales-history-entity',
  templateUrl: './sales-history-entity.component.html',
  styleUrls: ['./sales-history-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesHistoryEntityComponent extends BaseListComponent
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
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalVATRate',
      columnType: ColumnType.Number,
      caption: 'GENERAL.TOTAL_VAT',
      data: {
        type: NumberColumnType.Currency,
        digitsAfterDot: 4,
      },
      filterable: true,
      sortable: true,
    },
    {
      dataField: 'totalIncome',
      columnType: ColumnType.Number,
      data: {
        type: NumberColumnType.Currency,
      },
      caption: 'GENERAL.MARGIN',
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
    return this.client.get('sales/entitysalehistory', {
      service: Service.Reporting,
      params: this.requestBody,
    });
  }

  // colled from parent
  public onExport(): void {
    this._mixpanelService.track('B2B Sales Export');
    this.client
      .get('sales/entitysalehistory/excel', {
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
    const changePropName = this.currentState;
    if (this.currentState && this.currentState.stockItemName !== undefined) {
      changePropName['stockItemNameOrBarcode'] =
        changePropName['stockItemName'];
      delete changePropName['stockItemName'];
    }
    return new HttpParams({
      fromObject: {
        saleOrderDateFrom: formatRFC3339(new Date(this.dateFrom)),
        saleOrderDateTo: formatRFC3339(new Date(this.dateTo)),
        ...changePropName,
      },
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
