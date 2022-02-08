import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MixpanelService } from '@optimo/mixpanel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-waybills',
  templateUrl: './waybills.component.html',
  styleUrls: ['./waybills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaybillsComponent implements OnInit, OnDestroy {
  tabs = [
    { path: 'received', text: 'WAYBILLS.RECEIVED' },
    { path: 'issued', text: 'WAYBILLS.ISSUED' },
  ];

  all = true;

  firstLoad = true;

  selectedDateRange = false;
  dateRangeSelectItems = [
    {
      label: 'ბოლო 3 დღე',
      value: false,
    },
    {
      label: 'ყველა ჩანაწერი',
      value: true,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Waybills');
  }

  onRangeChange = ($event) => {
    this.router.navigate([], {
      queryParams: { all: this.all ? true : null },
      replaceUrl: true,
      queryParamsHandling: 'merge',
    });
  };

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ all }) => {
        this.all = all ? true : false;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
