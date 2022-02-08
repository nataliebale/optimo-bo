import { EReportType } from './EReportType';
import { IChartValue } from './IChartValue';
import { ITopTenItems } from './ITopTenItems';
export interface IReport {
	type: EReportType;
	sum: number;
	disable: boolean;
	show: boolean;
}


