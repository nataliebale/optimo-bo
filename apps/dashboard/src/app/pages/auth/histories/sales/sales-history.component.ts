import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  endOfToday,
  startOfToday,
  subDays,
  format,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { filter, takeUntil } from 'rxjs/operators';
import { SalesHistoryEntityComponent } from './entity/sales-history-entity.component';
import { SalesHistoryRetailComponent } from './retail/sales-history-retail.component';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-sales-history',
  templateUrl: './sales-history.component.html',
  styleUrls: ['./sales-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesHistoryComponent implements OnInit, OnDestroy {
  endOfToday = endOfToday();
  private defaultDate = [subDays(startOfToday(), 15), this.endOfToday];

  private _dateRange: Date[] = this.defaultDate;

  firstLoad = true;

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

  private child: SalesHistoryRetailComponent | SalesHistoryEntityComponent;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Sales');
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
    child: SalesHistoryRetailComponent | SalesHistoryEntityComponent
  ) {
    this.child = child;
    console.log('this.child', this.child);
  }

  onExport(): void {
    if (this.child) {
      this.child.onExport();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
