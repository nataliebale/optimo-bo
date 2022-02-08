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
	startOfToday,
	format,
	startOfDay,
	endOfDay,
} from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-popular-products',
	templateUrl: './popular-products.component.html',
	styleUrls: ['./popular-products.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularProductsComponent implements OnInit, OnDestroy {
	endOfToday = endOfToday();

	private defaultDate = [startOfToday(), this.endOfToday];

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

	private unsubscribe$ = new Subject<void>();

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private cdr: ChangeDetectorRef
	) { }

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


	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
