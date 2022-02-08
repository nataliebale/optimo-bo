import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { georgian } from '@optimo/ui-chart';
import { IChartValue } from '../../models';

@Component({
  selector: 'app-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrls: ['./date-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateChartComponent implements OnInit, AfterViewInit {
  @Input() chartId: string;
  @Input() chartData: IChartValue[];
  chart: am4charts.XYChart;
  constructor() {}

  initializeChart() {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
    // Themes end

    // Create chart instance
    this.chart = am4core.create(this.chartId, am4charts.XYChart);

    this.chart.language.locale = georgian;

    this.chart.numberFormatter.numberFormat = "#,###.00|#,###.00";

    // Add data
    this.chart.data = this.chartData;

    // Set input format for the dates
    this.chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';


    // Create axes
    const dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    const valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());


    // Create series
    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'label';
    series.tooltipText = '{value.formatNumber("#,###.00|#,###.00")}';
    series.strokeWidth = 2;
    series.minBulletDistance = 15;
    series.fill = am4core.color('#4563ff');
    series.stroke = am4core.color("#4563ff");

    // Drop-shaped tooltips
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.strokeOpacity = 0;
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.label.minWidth = 40;
    series.tooltip.label.minHeight = 40;
    series.tooltip.label.textAlign = 'middle';

    // Make bullets grow on hover
    const bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.circle.strokeWidth = 2;
    bullet.circle.radius = 4;
    bullet.circle.fill = am4core.color('#fff');

    const bullethover = bullet.states.create('hover');
    bullethover.properties.scale = 1.3;

    // Make a panning cursor
    this.chart.cursor = new am4charts.XYCursor();
    this.chart.cursor.behavior = 'panXY';
    this.chart.cursor.xAxis = dateAxis;
    this.chart.cursor.snapToSeries = series;

    this.chart.zoomOutButton.align = "left";

    // // Create vertical scrollbar and place it before the value axis
    // this.chart.scrollbarY = new am4core.Scrollbar();
    // this.chart.scrollbarY.parent = this.chart.leftAxesContainer;
    // this.chart.scrollbarY.toBack();

    // // Create a horizontal scrollbar with previe and place it underneath the date axis
    // this.chart.scrollbarX = new am4charts.XYChartScrollbar();
    // this.chart.scrollbarX['series'].push(series);
    // this.chart.scrollbarX.parent = this.chart.bottomAxesContainer;

    // dateAxis.start = 0.79;
    // dateAxis.keepSelection = true;
  }

  ngOnInit(): void {}
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
    this.initializeChart();
  }
}
