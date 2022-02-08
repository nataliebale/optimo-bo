import {
	Component,
	OnInit,
	AfterViewInit,
	Input,
	SimpleChanges,
	ChangeDetectionStrategy,
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { georgian } from '@optimo/ui-chart';
import { IChartValue } from '../../models';
@Component({
	selector: 'app-column-chart',
	templateUrl: './column-chart.component.html',
	styleUrls: ['./column-chart.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnChartComponent implements OnInit, AfterViewInit {
	@Input() chartId: string;
	@Input() chartData: IChartValue[];
	chart: am4charts.XYChart;
	constructor() { }

	initialize() {

		am4core.useTheme(am4themes_animated);
		am4core.options.commercialLicense = true;
		// Themes end

		// Create chart instance
		this.chart = am4core.create(this.chartId, am4charts.XYChart);

		this.chart.language.locale = georgian;

		this.chart.numberFormatter.numberFormat = "#,###.00|#,###.00|'00.00'";

		this.chart.fontSize = 14;

		// Add data
		this.chart.data = this.chartData;

		// Create axes

		const categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = 'label';
		categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.minGridDistance = 30;
		categoryAxis.renderer.grid.template.disabled = true;
		this.chart.zoomOutButton.align = "left";

		// categoryAxis.renderer.labels.template.adapter.add('dy', function (
		//   dy,
		//   target
		// ) {
		//   // tslint:disable-next-line: no-bitwise triple-equals
		//   if (target.dataItem && target.dataItem.index & +(2 == 2)) {
		//     return dy + 25;
		//   }
		//   return dy;
		// });

		const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

		// Create series
		const series = this.chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.valueY = 'value';
		series.dataFields.categoryX = 'label';
		series.name = 'Value';
		series.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]';
		series.columns.template.fillOpacity = 1;
		series.columns.template.fill = am4core.color('#4563ff');
		series.columns.template.stroke = am4core.color('#4563ff');
		series.columns.template.column.cornerRadiusTopLeft = 2;
		series.columns.template.column.cornerRadiusTopRight = 2;
		const columnTemplate = series.columns.template;
		columnTemplate.strokeWidth = 2;
		columnTemplate.strokeOpacity = 1;
	}

	ngOnInit(): void { }

	// tslint:disable-next-line: use-lifecycle-interface
	ngOnChanges(changes: SimpleChanges) {
		if (
			changes.chartData &&
			changes.chartData.currentValue &&
			changes.chartData.previousValue
		) {
			if (
				JSON.stringify(changes.chartData.currentValue) !==
				JSON.stringify(changes.chartData.previousValue)
			) {
				this.chart.data = this.chartData;
			}
		}
	}

	ngAfterViewInit(): void {
		this.initialize();
	}
}
