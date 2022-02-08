import {
	startOfToday,
	endOfToday,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	startOfDay,
	endOfDay,
	differenceInCalendarDays,
	addDays,
	subDays,
	subMonths,
	subYears
} from 'date-fns';
import { ICustomDateRanges } from './ICustomDateRanges';

export class DateManipulation {
	private _dateRange: Date | Date[];
	constructor(dateRange: Date | Date[]) {
		this._dateRange = dateRange;
	}

	public goToNextOrPrev(next: boolean): Date | Date[] {
		let newRange: Date[] | Date;
		if (Array.isArray(this._dateRange)) {
			const start = this._dateRange[0];
			const end = this._dateRange[1];
			const day: number = differenceInCalendarDays(end, start);
			if (next) {
				newRange = [startOfDay(addDays(end, 1)), endOfDay(addDays(end, day + 1))];
			} else {
				newRange = [startOfDay(addDays(start, -day - 1)), endOfDay(addDays(start, -1))];
			}
			if (newRange[1] > endOfToday()) {
				return null;
			}
		} else {
			newRange = next ? subDays(this._dateRange, -1) : subDays(this._dateRange, 1);
			if (newRange > endOfToday()) {
				return null;
			}
		}
		return newRange;
	}


	public getMyCustomRanges(): ICustomDateRanges[] {
		return [
			{
				id: 1,
				title: 'დღეს',
				active: true,
				ranges: [startOfToday(), endOfToday()]
			},
			{
				id: 2,
				title: 'ბოლო 7 დღე',
				active: false,
				ranges: [subDays(startOfToday(), 6), endOfToday()]
			},
			{
				id: 3,
				title: 'წინა კვირა',
				active: false,
				ranges: [
					startOfWeek(subDays(startOfToday(), 7), { weekStartsOn: 1 }),
					endOfWeek(subDays(endOfToday(), 7), { weekStartsOn: 1 })
				]
			},
			{
				id: 4,
				title: 'ბოლო 30 დღე',
				active: false,
				ranges: [subDays(startOfToday(), 29), endOfToday()]
			},
			{
				id: 5,
				title: 'წინა თვე',
				active: false,
				ranges: [startOfMonth(subMonths(startOfToday(), 1)), endOfMonth(subMonths(endOfToday(), 1))]
			},
			{
				id: 6,
				title: 'მიმდინარე წელი',
				active: false,
				ranges: [startOfYear(startOfToday()), endOfToday()]
			},
			{
				id: 7,
				title: 'წინა წელი',
				active: false,
				ranges: [startOfYear(subYears(startOfToday(), 1)), endOfYear(subYears(endOfToday(), 1))]
			}
		];
	}
}
