import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  endOfToday,
  subDays,
  startOfToday,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { SaleOrdersHistoryEntityComponent } from './entity/sale-orders-history-entity.component';
import { SaleOrdersHistoryRetailComponent } from './retail/sale-orders-history-retail.component';
import { Subject } from 'rxjs';
import { MixpanelService } from '@optimo/mixpanel';
@Component({
  selector: 'app-sale-orders-history',
  templateUrl: './sale-orders-history.component.html',
  styleUrls: ['./sale-orders-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleOrdersHistoryComponent implements OnInit, OnDestroy {
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];

  private _dateRange: Date[] = this.defaultDate;

  firstLoad = true;

  isUploadDropdownActive: boolean;

  set dateRange(value: Date[]) {
    if (!value) {
      value = this.defaultDate;
    }

    this._dateRange = value;
    const params = {
      dateFrom: format(value[0], 'yyyy-MM-dd'),
      dateTo: format(value[1], 'yyyy-MM-dd'),
    };
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  get dateRange(): Date[] {
    return this._dateRange;
  }

  private child:
    | SaleOrdersHistoryRetailComponent
    | SaleOrdersHistoryEntityComponent;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Transactions');
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ dateFrom, dateTo }) => {
        if (dateFrom && dateTo) {
          this.dateRange = [
            startOfDay(new Date(dateFrom)),
            endOfDay(new Date(dateTo)),
          ];
        } else {
          this.dateRange = this.defaultDate;
        }
        this.cdr.markForCheck();
      });
  }

  onDateChanged(dateRange: Date[]): void {
    this.dateRange = dateRange;
  }

  onChildChanged(
    child: SaleOrdersHistoryRetailComponent | SaleOrdersHistoryEntityComponent
  ) {
    this.child = child;
  }

  onExport(): void {
    if (this.child) {
      this.child.onExport();
    }
  }

  onItemsExport(): void {
    // this._mixpanelService.track('B2C Transactions Export');
    if (this.child) {
      this.child.onItemsExport();
    }
  }

  toggleUploadDropdown(): void {
    this.isUploadDropdownActive = !this.isUploadDropdownActive;
    this.cdr.markForCheck();
  }

  onImport(rs?: boolean, months?: number): void {
    // let params: HttpParams;
    // if (rs && months) {
    //   params = new HttpParams({
    //     fromObject: { lastXMonths: months.toString() },
    //   });
    // }
    // const request = this.client.get<any>(
    //   'stockitems/excel-import-template' + (rs ? '-rs' : ''),
    //   { params, responseType: 'blob' }
    // );
    // this.dialog
    //   .open(LoadingPopupComponent, {
    //     width: '548px',
    //     data: {
    //       observable: request,
    //       message: 'მიმდინარეობს პროდუქტების ჩამოტვირთვა',
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((response: HttpResponse<Blob>) => {
    //     if (response) {
    //       this.fileDownloadHelper.downloadFromResponse(
    //         response,
    //         'application/ms-excel'
    //       );
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
