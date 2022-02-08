import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ColumnData } from '@optimo/ui-table';
import { ClientService, Service } from '@optimo/core';
import { Subject, OperatorFunction, of } from 'rxjs';
import { formatRFC3339 } from 'date-fns';
import { takeUntil, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { FileDownloadHelper } from 'apps/dashboard/src/app/core/helpers/file-download/file-download.helper.ts';

@Component({
  selector: 'app-categories-report-grid-table',
  templateUrl: './categories-report-grid-table.component.html',
  styleUrls: ['./categories-report-grid-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesReportGridTableComponent implements OnInit, OnDestroy {
  @Input()
  totalCount: number;

  private _categoryId: number;

  @Input()
  set categoryId(value: number) {
    this._categoryId = value;
    this.clearData();
    this.requestItems.next();
  }

  get categoryId(): number {
    return this._categoryId;
  }

  private _dateRange: Date[];

  @Input()
  set dateRange(value: Date[]) {
    this._dateRange = value;
    this.clearData();
    this.requestItems.next();
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  @Input()
  columns: ColumnData[];

  @Input()
  endPoint: string;

  @Input()
  excelEndPoint: string;

  @Input()
  defaultSort: string;

  @Input()
  defaultSortDirection: string;

  private requestItems = new Subject<void>();
  private currentState: { [param: string]: string };

  dataSource: any[];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private fileDownloadHelper: FileDownloadHelper
  ) {}

  ngOnInit(): void {
    this.requestItems
      .pipe(
        debounceTime(200),
        this.toHttpGetItems,
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        this.dataSource = data;
        this.cdr.markForCheck();
      });
  }

  private get toHttpGetItems(): OperatorFunction<void, any> {
    return switchMap(() => {
      if (!this.categoryId || !this.dateRange) {
        return of([]);
      }
      const saleOrderDateFrom = formatRFC3339(this.dateRange[0]);
      const saleOrderDateTo = formatRFC3339(this.dateRange[1]);

      return this.client
        .get(this.endPoint, {
          service: Service.Reporting,
          params: new HttpParams({
            fromObject: {
              stockItemCategoryId: this.categoryId.toString(),
              pageSize: this.totalCount.toString(),
              sortField: this.currentState.sortField,
              sortOrder: this.currentState.sortOrder,
              saleOrderDateFrom,
              saleOrderDateTo,
            },
          }),
        })
        .pipe(
          catchError(() => {
            return of([]);
          }),
          takeUntil(this.unsubscribe$)
        );
    });
  }

  onExport(): void {
    if (!this.categoryId || !this.dateRange) {
      return;
    }
    const saleOrderDateFrom = formatRFC3339(this.dateRange[0]);
    const saleOrderDateTo = formatRFC3339(this.dateRange[1]);

    this.client
      .get(this.excelEndPoint, {
        params: new HttpParams({
          fromObject: {
            stockItemCategoryId: this.categoryId.toString(),
            pageSize: this.totalCount.toString(),
            sortField: this.currentState.sortField,
            sortOrder: this.currentState.sortOrder,
            saleOrderDateFrom,
            saleOrderDateTo,
          },
        }),
        service: Service.Reporting,
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

  private clearData(): void {
    this.dataSource = null;
  }

  onTableStateChanged(state: { [param: string]: string }): void {
    this.currentState = state;
    this.requestItems.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestItems.complete();
  }
}
