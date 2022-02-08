import { HttpParams, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ClientService } from '@optimo/core';
import {
  ColumnData,
  ColumnType,
  NumberColumnType,
  SelectionData,
} from '@optimo/ui-table';
import { textIsTruncated } from 'libs/ui/table/src/lib/utils/text-is-truncated';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FileDownloadHelper } from '../../../core/helpers/file-download/file-download.helper.ts';
import { IChunkedResponse } from '../../../models/response/IChunkedResponse';

interface ITableState {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  length?: number;
  previousPageIndex?: number;
}

@Component({
  selector: 'optimo-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss'],
})
export class SuppliersComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'locationName',
      columnType: ColumnType.Text,
      caption: 'ფილიალის სახელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 300,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'legalEntityName',
      columnType: ColumnType.Text,
      caption: 'მაღაზიის სახელი',
      filterable: true,
      sortable: true,
      widthCoefficient: 300,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'locationAddressDistrict',
      columnType: ColumnType.Text,
      caption: 'უბანი',
      filterable: true,
      sortable: true,
      widthCoefficient: 250,
      canNotChangeVisibility: true,
    },
    {
      dataField: 'locationAddress',
      columnType: ColumnType.Text,
      caption: 'მისამართი',
      filterable: true,
      sortable: true,
      widthCoefficient: 250,
    },
    {
      dataField: 'managerNameOrPhoneNumber',
      columnType: ColumnType.Text,
      caption: 'საკონტაქტო ინფო',
      filterable: true,
      sortable: true,
      widthCoefficient: 325,
    },
    {
      dataField: 'locationLowStockRatio',
      columnType: ColumnType.Number,
      caption: 'მინ. მარაგი (%)',
      data: {
        type: NumberColumnType.Percent,
      },
      filterable: true,
      sortable: true,
      widthCoefficient: 202,
      canNotChangeVisibility: true,
    },
  ];

  datasource: any[] = [];
  totalCount = 0;
  isAllSelected: boolean;
  isExcelDropdownActive = false;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private title: Title,
    private fileDownloadHelper: FileDownloadHelper
  ) {}

  ngOnInit(): void {
    this.title.setTitle('მარაგები');
  }

  onRowClick(row: any): void {
    const url = `/branch?legalEntityId=${row.legalEntityId}&locationId=${row.locationId}&pageTitle=${row.locationName}`;
    window.open(url, '_blank');
  }

  customEnableSelect = (row: any): boolean => {
    return true;
  };

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
    this.isAllSelected = selectionData.isAllSelected;
  }

  export(OnlyLowStock: boolean): void {
    const LegalEntitiesAndLocations = {};
    this.selectedRows.forEach((element) => {
      if (LegalEntitiesAndLocations[element.legalEntityId]) {
        LegalEntitiesAndLocations[element.legalEntityId] = [
          ...LegalEntitiesAndLocations[element.legalEntityId],
          element.locationId,
        ];
      } else {
        LegalEntitiesAndLocations[element.legalEntityId] = [element.locationId];
      }
    });
    const httpParams = new HttpParams({
      fromObject: {
        OnlyLowStock: String(OnlyLowStock),
        LegalEntitiesAndLocations: JSON.stringify(LegalEntitiesAndLocations),
      },
    });

    this.client
      .get<any>('stock/excel', {
        params: httpParams,
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

  onTableStateChanged(newTableState: ITableState): void {
    this.curTableState = {
      ...this.curTableState,
      ...newTableState,
    };
    this.fetchItems(this.curTableState);
  }

  private fetchItems(tableState: any): void {
    const params = new HttpParams({
      fromObject: tableState,
    });

    this.client
      .get<IChunkedResponse<any>>('stock/locations', { params })
      .pipe(debounceTime(200), takeUntil(this.unsubscribe$))
      .subscribe(
        (data) => {
          this.datasource = data.data;
          this.totalCount = data.totalCount;
          this.cdr.markForCheck();
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
