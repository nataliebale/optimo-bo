import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ClientService } from '@optimo/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierStatuses } from 'apps/dashboard/src/app/core/enums/supplier-statuses.enum';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-report',
  templateUrl: './supplier-report.component.html',
  styleUrls: ['./supplier-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierReportComponent implements OnInit, OnDestroy {
  private _supplierId: number;

  set supplierId(value: number) {
    this._supplierId = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { supplierId: value },
        queryParamsHandling: 'merge',
      });
    }
  }

  get supplierId(): number {
    return this._supplierId;
  }

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
      .subscribe((params) => {
        this.supplierId = +params.supplierId;
        this.cdr.markForCheck();
      });
  }

  getSuppliers = (state: any): Observable<any> => {
    let params = new HttpParams({
      fromObject: {
        sortField: 'name',
        sortOrder: 'ASC',
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        status: SupplierStatuses.Enabled.toString(),
      },
    });

    if (state.searchValue) {
      params = params.append('name', state.searchValue);
    }

    return this.client.get('suppliers', { params });
  };

  getSupplierById = (id: number): Observable<any> => {
    return this.client.get(`suppliers/${id}`);
  };

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
