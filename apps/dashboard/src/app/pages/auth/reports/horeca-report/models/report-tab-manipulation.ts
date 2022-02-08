import { ReportTypeTitles } from './EReportType';
import { IReportTab } from './IReportTab';

export class ReportTabManipulation {
	constructor() { }

	getReportTabs(reportTabs: IReportTab[]): IReportTab[] {
		const newReportTabs: IReportTab[] = [];
		reportTabs.forEach((report) => {
			newReportTabs.push({
				...report,
				title: ReportTypeTitles.get(report.type),
				type: report.type,
				value: report.sum,
			});
		});
		return newReportTabs;
	}
}
