import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-general-report',
  templateUrl: './general-report.component.html',
  styleUrls: ['./general-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralReportComponent implements OnInit, OnDestroy {
  private _year: number;

  set year(value: number) {
    this._year = value;
    if (value) {
      this.router.navigate([], {
        queryParams: { year: value },
        queryParamsHandling: 'merge'
      });
    }
  }

  get year(): number {
    return this._year;
  }

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ year }) => {
        if (year) {
          this.year = +year;
        }
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
