import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { georgian } from '@optimo/ui-chart';
import { IChartValue } from '../../models';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnInit, AfterViewInit {
  @Input() chartId: string;
  @Input() chartData: IChartValue[];
  chart: am4charts.XYChart;
  constructor() {}

  ngOnInit(): void {}

  initialize() {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
    // Themes end

    // Create chart instance
    this.chart = am4core.create(this.chartId, am4charts.XYChart);

    this.chart.language.locale = georgian;

    this.chart.numberFormatter.numberFormat = "#,###.00|#,###.00|'00.00'";

    // Add data
    this.chart.data = this.chartData;

    // Create axes
    const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;

    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());

    // Create series
    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'label';
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = '{valueY}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding(12, 12, 12, 12);

    // Add scrollbar
    this.chart.scrollbarX = new am4charts.XYChartScrollbar();
    this.chart.scrollbarX['series'].push(series);

    // Add cursor
    this.chart.cursor = new am4charts.XYCursor();
    this.chart.cursor.xAxis = dateAxis;
    this.chart.cursor.snapToSeries = series;
  }

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

  ngAfterViewInit() {
    this.initialize();
  }
}
