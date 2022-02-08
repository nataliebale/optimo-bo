import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryStatuses } from 'apps/dashboard/src/app/core/enums/category-status.enum';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { endOfToday, startOfToday } from 'date-fns';

@Component({
  selector: 'app-categories-report',
  templateUrl: './categories-report.component.html',
  styleUrls: ['./categories-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesReportComponent implements OnInit, OnDestroy {
  private _categoryId: number;

  set categoryId(value: number) {
    this._categoryId = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { categoryId: value },
        queryParamsHandling: 'merge',
      });
    }
  }

  get categoryId(): number {
    return this._categoryId;
  }

  category: any;
  endOfToday = endOfToday();

  private defaultDate = [startOfToday(), this.endOfToday];
  dateRange: Date[] = this.defaultDate;
  isDatePickerVisible: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ categoryId }) => {
        if (categoryId) {
          this.categoryId = +categoryId;
        }
        this.cdr.markForCheck();
      });
  }

  onCategoryChange(category: any): void {
    if (category) {
      this.category = category;
    }
  }

  getStockitemCategories = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: [CategoryStatuses.Enabled.toString(), CategoryStatuses.Disabled.toString()],
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get('stockitemcategories', { params });
  };

  getStockitemCategoryById = (id: number): Observable<any> => {
    return this.client.get(`stockitemcategories/${id}`);
  };

  onDateChanged(dateRange: Date[]): void {
    if (!dateRange) {
      dateRange = this.defaultDate;
    }
    this.dateRange = dateRange;

    this.onToggleDatePicker();
  }

  onToggleDatePicker(): void {
    this.isDatePickerVisible = !this.isDatePickerVisible;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
