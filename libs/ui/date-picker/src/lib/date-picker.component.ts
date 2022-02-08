import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import { endOfDay, endOfToday, startOfDay, startOfToday, startOfYear } from 'date-fns';
import flatpickr from 'flatpickr';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { DateManipulation } from './date-manipulation';
import { ICustomDateRanges } from './ICustomDateRanges';
import { Georgian } from './ka';

@Component({
	selector: 'app-date-picker',
	templateUrl: './date-picker.component.html',
	styleUrls: ['./date-picker.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements OnInit {
	@ViewChild('datepicker', { static: true })
	datepicker: ElementRef;

	@Input()
	isRangePicker = true;

	@Input()
	defaultDate: Date | Date[];

	@Input()
	maxDate: Date;

	@Input()
	minDate: Date;

	@Input()
	isMonthSelect: boolean;

	@Input()
	showMonths = 1;

	@Input()
	showActionsAndInput = true

	private _isDatePickerVisible: boolean;

	@Input()
	set isDatePickerVisible(value: boolean) {
		this._isDatePickerVisible = value;
		if (value) {
			this.initializeDatePicker();
		} else {
			if (this.datePickerEl && this.zone) {
				this.zone.runOutsideAngular(() => {
					this.datePickerEl.destroy();
				});
			}
		}
	}

	get isDatePickerVisible(): boolean {
		return this._isDatePickerVisible;
	}

	@Output()
	dateChange = new EventEmitter<Date | Date[]>();

	@Output()
	onIsDatePickerVisible = new EventEmitter<boolean>();

	myCustomRanges: ICustomDateRanges[];

	private datePickerEl: flatpickr.Instance;

	constructor(private zone: NgZone, private cdr: ChangeDetectorRef) { }

	ngOnInit(): void { }

	isActive(ranges: Date[]) {
		return JSON.stringify(this.defaultDate) === JSON.stringify(ranges);
	}

	onToggleDatePicker(value?: boolean) {
		this.isDatePickerVisible = value === undefined ? !this.isDatePickerVisible : value;
		this.onIsDatePickerVisible.emit(this.isDatePickerVisible);
	}

	goToNextOrPrev(next: boolean) {
		const newSelectedDate = new DateManipulation(
			this.defaultDate
		).goToNextOrPrev(next);
		if (newSelectedDate) {
			this.defaultDate = newSelectedDate;
			this.onDateChange();
		}
	}

	selectCustomRange(item: ICustomDateRanges): void {
		this.defaultDate = item.ranges;
		this.onDateChange();
	}

	initializeDatePicker() {
		this.zone.runOutsideAngular(() => {
			const options: any = {
				locale: Georgian,
				mode: this.isRangePicker ? 'range' : 'single',
				defaultDate: this.defaultDate,
				maxDate: this.maxDate,
				minDate: this.minDate,
				inline: true,
				prevArrow: '«',
				nextArrow: '»',
				static: true,
				onChange: this.onChange.bind(this),
				showMonths: this.showMonths,
				plugins: this.isMonthSelect
					? [
						new (monthSelectPlugin as any)({
							shorthand: true,
							dateFormat: 'm.y',
							altFormat: 'F Y',
						}),
					]
					: [],
			};

			this.datePickerEl = flatpickr(
				this.datepicker.nativeElement,
				options
			) as flatpickr.Instance;
		});
		this.myCustomRanges = new DateManipulation(
			this.defaultDate
		).getMyCustomRanges();
		this.datePickerEl.setDate(this.defaultDate);
	}

	private onChange(selectedDate: Date[]): void {
		if (selectedDate[1]) {
			this.defaultDate = [selectedDate[0], endOfDay(selectedDate[1])];
		} else {
			this.defaultDate = selectedDate[0];
		}
		if (!selectedDate[1] && this.isRangePicker) {
			return;
		}
		this.onDateChange();
	}

	private onDateChange(): void {
		this.dateChange.emit(this.defaultDate);
		this.datePickerEl.setDate(this.defaultDate);
		this.cdr.detectChanges();
	}
}
