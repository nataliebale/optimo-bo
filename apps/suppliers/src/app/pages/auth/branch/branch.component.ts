import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ClientService, PageTitleService } from '@optimo/core';
import { ColumnData, ColumnType, NumberColumnType } from '@optimo/ui-table';
import { textIsTruncated } from 'libs/ui/table/src/lib/utils/text-is-truncated';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
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
  selector: 'optimo-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
})
export class BranchComponent implements OnInit {
  public textIsTruncated = textIsTruncated;
  protected unsubscribe$ = new Subject<void>();
  protected requestItems = new Subject<void>();

  isLoading: boolean;
  selectedRows: any[];
  curTableState: Partial<ITableState> = {};

  displayedColumns: ColumnData[] = [
    {
      dataField: 'stockItemPhotoUrl',
      columnType: ColumnType.Text,
      caption: 'სურათი',
      filterable: false,
      sortable: false,
      widthCoefficient: 165,
    },
    {
      dataField: 'stockItemNameOrBarcode',
      columnType: ColumnType.Text,
      caption: 'დასახელება/ბარკოდი',
      filterable: true,
      sortable: true,
      widthCoefficient: 345,
    },
    {
      dataField: 'stockItemCategoryName',
      columnType: ColumnType.Text,
      caption: 'კატეგორია',
      filterable: true,
      sortable: true,
      widthCoefficient: 345,
    },
    {
      dataField: 'stockItemQuantityOnHand',
      columnType: ColumnType.Number,
      caption: 'მარაგი',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'StockItemUnitOfMeasurement',
      },
      filterable: true,
      sortable: true,
      widthCoefficient: 260,
    },
    {
      dataField: 'lowStock',
      columnType: ColumnType.Number,
      caption: 'მინ. მარაგი (%)',
      data: {
        type: NumberColumnType.Percent,
      },
      filterable: false,
      sortable: false,
      widthCoefficient: 260,
    },
    {
      dataField: 'stockItemLowStockRatio',
      columnType: ColumnType.Number,
      caption: 'მინ. მარაგი',
      data: {
        type: NumberColumnType.Quantity,
        UOMFieldName: 'StockItemUnitOfMeasurement',
      },
      filterable: true,
      sortable: true,
      widthCoefficient: 315,
    },
  ];

  datasource: any[] = [];
  totalCount = 0;
  isAllSelected: boolean;
  legalEntityId: string;
  locationId: string;

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private title: Title,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit(): void {
    this.title.setTitle(this.route.snapshot.queryParams.pageTitle);
    this.legalEntityId = this.route.snapshot.queryParams.legalEntityId;
    this.locationId = this.route.snapshot.queryParams.locationId;
    this.pageTitleService.updateTitle(
      this.route.snapshot.queryParams.pageTitle
    );
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
      fromObject: {
        legalEntityId: this.legalEntityId,
        locationId: this.locationId,
        ...tableState,
      },
    });

    this.client
      .get<IChunkedResponse<any>>('stock/single-location', { params })
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
