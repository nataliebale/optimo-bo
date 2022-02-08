import {
	Input,
	TemplateRef,
	EventEmitter,
	Output,
	Inject,
	ChangeDetectorRef,
	OnDestroy,
	Directive,
} from '@angular/core';
import { ColumnData, ColumnType } from '../../table.component';
import { CellDirective } from '../../directives/cell.directive';
import { HeaderCellDirective } from '../../directives/header-cell.directive';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { isEqual, cloneDeep } from 'lodash-es';

@Directive()
export abstract class ColumnTemplate implements OnDestroy {
	@Input()
	col: ColumnData;

	@Input()
	set state(value: { [key: string]: string | number | string[] | number[] }) {
		if (value && this.filterForm) {
			this.updateForm(cloneDeep(value));
		}
	}

	@Input()
	cellTmpl: TemplateRef<CellDirective>;

	@Input()
	headerCellTmpl: TemplateRef<HeaderCellDirective>;

	@Output()
	changeFilter = new EventEmitter<object>();

	@Output()
	cellClick = new EventEmitter<any>();

	isFilterVisible: boolean;

	checkFilterChange = new Subject<void>();
	private unsubscribe$ = new Subject<void>();

	filterForm: FormGroup;

	protected lastEmitedFilterValue: any;

	constructor(
		@Inject(DOCUMENT) protected document: any,
		private cdr: ChangeDetectorRef
	) { }

	protected abstract updateForm(state: {
		[key: string]: string | number | string[] | number[];
	}): void;

	protected listenCheckFilterChange(subscribe: () => void) {
		this.lastEmitedFilterValue = cloneDeep(this.filterForm.value);
		this.checkFilterChange
			.pipe(debounceTime(300), takeUntil(this.unsubscribe$))
			.subscribe(() => {
				if (!isEqual(this.lastEmitedFilterValue, this.filterForm.value)) {
					subscribe();
					this.lastEmitedFilterValue = cloneDeep(this.filterForm.value);
				}
			});
	}

	onSubmit(reset?: boolean): void {
		console.log(
			'TCL: ColumnTemplate -> this.filterForm',
			reset,
			this.filterForm.invalid,
			this.filterForm.pristine,
			this.filterForm
		);
		if (!reset && (this.filterForm.invalid || this.filterForm.pristine)) {
			return;
		}

		this.filterForm.markAsPristine();
		this.checkFilterChange.next();
		if (this.col.columnType !== ColumnType.Date) {
			this.onToggleFilter();
		}
	}

	onToggleFilter(e?: Event) {
		console.log('TCL: ColumnTemplate -> onToggleFilter -> e', e);
		this.isFilterVisible = !this.isFilterVisible;
		this.cdr.markForCheck();
		if (e) {
			e.stopPropagation();
			if (this.isFilterVisible) {
				this.document.getElementsByTagName('html')[0].click();
			}
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		this.checkFilterChange.complete();
	}
}
