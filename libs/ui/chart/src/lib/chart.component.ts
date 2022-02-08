import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animates from '@amcharts/amcharts4/themes/animated';
import { DynamicSelectComponent } from '@optimo/ui-dynamic-select';
import {
  AxisConfig,
  ChartAxisTypes,
  ChartConfig,
  ChartSeries as ChartSeriesConfig,
  ChartSeriesTypes,
  ChartTypes,
  ReportPeriods,
} from './chart.model';
import { georgian } from './localization/ka-GE';

am4core.useTheme(am4themes_animates);
am4core.options.commercialLicense = true;

interface State {
  period: ReportPeriods;
  selectedItems: string | string[];
  isSelectedAll: boolean;
}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DynamicSelectComponent)
  dynamicSelector: any;

  private _chartConfig: ChartConfig;
  @Input()
  get chartConfig(): ChartConfig {
    return this._chartConfig;
  }
  set chartConfig(value: ChartConfig) {
    this._chartConfig = value;
    this.reloadChart();
    if (this.chart) {
      this.chart.dispose();
    }
    this.initializeChart();
  }

  private _dataSource: any[];

  @Input()
  set dataSource(value: any[]) {
    this._dataSource = value;
    this.reloadChart();
  }

  get dataSource(): any[] {
    return this._dataSource;
  }

  private _selectDataGetter: any;

  @Input()
  set selectDataGetter(value: any) {
    this._selectDataGetter = value;
    this.reloadDynamicSelector();
  }

  get selectDataGetter() {
    return this._selectDataGetter;
  }

  @Input()
  selectMultiple: boolean;

  @Input()
  maxSelectedItems: number;

  @Input()
  hasSelectAll: boolean;

  @Input()
  hasPeriodSelect = true;

  @Input()
  hasExportButton = true;

  @Output()
  stateChange = new EventEmitter<State>();

  private _selectedPeriod: ReportPeriods;

  set selectedPeriod(value: ReportPeriods) {
    this._selectedPeriod = value;
    this.updateState();
  }

  get selectedPeriod(): ReportPeriods {
    return this._selectedPeriod;
  }

  private chart: am4charts.SerialChart;

  private _selectedItems: string | string[];

  set selectedItems(value: string | string[]) {
    this._selectedItems = value;
    this.updateState();
  }

  get selectedItems(): string | string[] {
    return this._selectedItems;
  }

  private _isSelectedAll = true;

  set isSelectedAll(value: boolean) {
    this._isSelectedAll = value;
    this.updateState();
  }

  get isSelectedAll(): boolean {
    return this._isSelectedAll;
  }

  periodOptions = [
    {
      id: ReportPeriods.Year,
      text: 'წელი',
    },
    {
      id: ReportPeriods.Quarter,
      text: 'კვარტალი',
    },
    {
      id: ReportPeriods.Month,
      text: 'თვე',
    },
    {
      id: ReportPeriods.Week,
      text: 'კვირა',
    },
  ];

  chartRefId = `chart-div-${Math.floor(Math.random() * 999)}`;

  constructor(private zone: NgZone) {}

  createSeries(
    seriesConfig: ChartSeriesConfig,
    xAxis: AxisConfig = null,
    yAxis: AxisConfig = null,
    data: any = []
  ): any {
    switch (seriesConfig.type) {
      case ChartSeriesTypes.Column:
        return this.createColumnSeries(seriesConfig, xAxis, yAxis, data);
      case ChartSeriesTypes.Line:
        return this.createLineSeries(seriesConfig, xAxis, yAxis, data);
      case ChartSeriesTypes.Pie:
        return this.createPieSeries(seriesConfig);
    }
  }

  createPieSeries(
    seriesConfig: ChartSeriesConfig,
    data: any = []
  ): am4charts.PieSeries {
    const series = new am4charts.PieSeries();
    series.dataFields.category = seriesConfig.keyField;
    series.dataFields.value = seriesConfig.valueField;
    series.slices.template.propertyFields.fill = seriesConfig.colorField;
    series.slices.template.strokeWidth = 1;
    series.slices.template.stroke = am4core.color('#fff');
    series.labels.template.disabled = true;
    series.data = data;
    series.name = seriesConfig.text;
    return series;
  }

  createLineSeries(
    seriesConfig: ChartSeriesConfig,
    xAxis: AxisConfig,
    yAxis: AxisConfig,
    data: any = []
  ): am4charts.LineSeries {
    const series = new am4charts.LineSeries();

    series.tensionX = 0.95;
    series.strokeWidth = 2.5;
    series.stroke = am4core.color(seriesConfig.color);
    series.fill = am4core.color(seriesConfig.color);
    series.name = seriesConfig.text;

    series.cursorTooltipEnabled = false;
    series.data = data;

    switch (xAxis.type) {
      case ChartAxisTypes.CategoryAxis:
        series.dataFields.categoryX = seriesConfig.keyField;
        break;
      case ChartAxisTypes.DateAxis:
        series.dataFields.dateX = seriesConfig.keyField;
        break;
      case ChartAxisTypes.ValueAxis:
        series.dataFields.valueX = seriesConfig.keyField;
        break;
    }

    switch (yAxis.type) {
      case ChartAxisTypes.CategoryAxis:
        series.dataFields.categoryY = seriesConfig.valueField;
        break;
      case ChartAxisTypes.DateAxis:
        series.dataFields.dateY = seriesConfig.valueField;
        break;
      case ChartAxisTypes.ValueAxis:
        series.dataFields.valueY = seriesConfig.valueField;
        break;
    }

    if (seriesConfig.bullets) {
      const bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = am4core.color(seriesConfig.color);
      bullet.tooltipText = seriesConfig.tooltipText;
    }

    return series;
  }

  createColumnSeries(
    seriesConfig: ChartSeriesConfig,
    xAxis: AxisConfig,
    yAxis: AxisConfig,
    data: any = []
  ): am4charts.ColumnSeries {
    const series = new am4charts.ColumnSeries();
    series.strokeWidth = 1;
    series.stroke = am4core.color(seriesConfig.color);
    series.columns.template.stroke = am4core.color(seriesConfig.color);
    series.columns.template.fill = am4core.color(seriesConfig.color);
    series.fill = am4core.color(seriesConfig.color);

    series.data = data;
    series.stacked = seriesConfig.stacked;
    series.tooltip.pointerOrientation = 'vertical';
    series.columns.template.tooltipText = seriesConfig.tooltipText;
    series.name = seriesConfig.text;
    series.cursorTooltipEnabled = false;

    switch (xAxis.type) {
      case ChartAxisTypes.CategoryAxis:
        series.dataFields.categoryX = seriesConfig.keyField;
        break;
      case ChartAxisTypes.DateAxis:
        series.dataFields.dateX = seriesConfig.keyField;
        break;
      case ChartAxisTypes.ValueAxis:
        series.dataFields.valueX = seriesConfig.keyField;
        break;
    }

    switch (yAxis.type) {
      case ChartAxisTypes.CategoryAxis:
        series.dataFields.categoryY = seriesConfig.valueField;
        break;
      case ChartAxisTypes.DateAxis:
        series.dataFields.dateY = seriesConfig.valueField;
        break;
      case ChartAxisTypes.ValueAxis:
        series.dataFields.valueY = seriesConfig.valueField;
        break;
    }

    if (seriesConfig.columnRadius) {
      const columnTemplate = series.columns.template;
      columnTemplate.column.cornerRadiusTopLeft = seriesConfig.columnRadius;
      columnTemplate.column.cornerRadiusTopRight = seriesConfig.columnRadius;
      columnTemplate.column.cornerRadiusBottomLeft = seriesConfig.columnRadius;
      columnTemplate.column.cornerRadiusBottomRight = seriesConfig.columnRadius;
      columnTemplate.width = 14;
    }

    if (seriesConfig.criticalValueField) {
      series.columns.template.adapter.add('fill', (fill, target, key) => {
        return target.dataItem &&
          target.dataItem.dataContext[seriesConfig.valueField] <
            target.dataItem.dataContext[seriesConfig.criticalValueField]
          ? am4core.color(seriesConfig.criticalValueColor)
          : fill;
      });
      series.columns.template.adapter.add('stroke', (stroke, target, key) => {
        return target.dataItem &&
          target.dataItem.dataContext[seriesConfig.valueField] <
            target.dataItem.dataContext[seriesConfig.criticalValueField]
          ? am4core.color(seriesConfig.criticalValueColor)
          : stroke;
      });
    }

    return series;
  }

  initializeChart() {
    switch (this.chartConfig.type) {
      case ChartTypes.Pie:
        this.initializePieChart();
        break;
      case ChartTypes.XY:
        this.initializeXYChart();
        break;
    }
    this.chart.language.locale = georgian;

    this.chart.numberFormatter.numberFormat = "#,###.00|#,###.00|'00.00'";
  }

  initializePieChart() {
    let chart: am4charts.PieChart;

    chart = am4core.create(this.chartRefId, am4charts.PieChart);

    if (this.chartConfig.innerRadius) {
      chart.innerRadius = am4core.percent(this.chartConfig.innerRadius);
    }

    if (this.chartConfig.legend) {
      chart.legend = new am4charts.Legend();
      chart.legend.position = this.chartConfig.legendPosition || 'right';
    }

    this.chartConfig.series.forEach((seriesConfig) => {
      chart.series.push(this.createSeries(seriesConfig));
    });
    this.chart = chart;
  }

  initializeXYChart() {
    let chart: am4charts.XYChart;
    chart = am4core.create(this.chartRefId, am4charts.XYChart);
    chart.margin(0, 0, 0, 0);
    chart.padding(0, 0, 0, 0);

    const xAxis = this.addAxis(chart.xAxes, this.chartConfig.xAxisConfig);
    const yAxis = this.addAxis(chart.yAxes, this.chartConfig.yAxisConfig);

    if (this.chartConfig.legend) {
      chart.legend = new am4charts.Legend();
      chart.legend.position = this.chartConfig.legendPosition;
      chart.legend.useDefaultMarker = true;
      chart.legend.fontSize = 16;
      const marker = chart.legend.markers.template.children.getIndex(
        0
      ) as am4core.RoundedRectangle;

      marker.cornerRadius(10, 10, 10, 10);
      marker.height = 17;
      marker.width = 17;

      marker.paddingTop = 7;
      marker.paddingLeft = 7;
    }

    if (this.chartConfig.colors) {
      chart.colors.list = this.chartConfig.colors.map((c) => am4core.color(c));
    }
    if (this.chartConfig.cursor) {
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.xAxis = xAxis;
      chart.cursor.behavior = 'none';

      chart.cursor.lineY.disabled = true;
      yAxis.cursorTooltipEnabled = false;
    }

    this.chart = chart;
  }

  addAxis(axes: any, axisConfig: AxisConfig): am4charts.Axis {
    let axis: am4charts.Axis<am4charts.AxisRenderer>;
    switch (axisConfig.type) {
      case ChartAxisTypes.CategoryAxis:
        axis = axes.push(new am4charts.CategoryAxis());
        break;
      case ChartAxisTypes.DateAxis:
        axis = axes.push(new am4charts.DateAxis());
        break;
      case ChartAxisTypes.ValueAxis:
        const valueAxis = new am4charts.ValueAxis();
        if (axisConfig?.gridMinValue?.toString) {
          valueAxis.min = axisConfig.gridMinValue;
        }
        if (axisConfig?.gridMaxValue?.toString) {
          valueAxis.max = axisConfig.gridMaxValue;
        }
        axis = axes.push(valueAxis);
        break;
    }

    axis.title.text = this.chartConfig.xAxisConfig.title;
    axis.title.fontSize = axisConfig.titleFontSize;
    axis.title.fontWeight = axisConfig.titleFontWeight;

    if (axisConfig.minGridDistance !== undefined) {
      axis.renderer.minGridDistance = axisConfig.minGridDistance;
    }

    if (axisConfig.startLocation !== undefined) {
      axis.startLocation = axisConfig.startLocation;
    }

    if (axisConfig.labelWrap) {
      axis.renderer.labels.template.wrap = axisConfig.labelWrap;
      axis.renderer.labels.template.maxWidth = axisConfig.labelMaxWidth;
    }

    axis.renderer.labels.template.fontWeight = axisConfig.labelFontWeight;
    axis.renderer.labels.template.fontSize = axisConfig.labelFontSize;
    axis.renderer.labels.template.rotation = axisConfig.labelRotation;

    axis.renderer.minLabelPosition = 0;
    axis.renderer.maxLabelPosition = 0.98;

    if (axisConfig.endToEnd) {
      axis.renderer.grid.template.location = 0.5;
      axis.renderer.labels.template.location = 0.5;

      axis.renderer.minLabelPosition = 0;
      axis.renderer.maxLabelPosition = 1;

      axis.startLocation = 0.5;
      axis.endLocation = 0.5;
    }

    if (axisConfig.disableGrid) {
      axis.renderer.grid.template.disabled = axisConfig.disableGrid;
      axis.renderer.baseGrid.disabled = axisConfig.disableGrid;
    }

    if (axisConfig.hidden) {
      axis.hidden = axisConfig.hidden;
      axis.renderer.disabled = axisConfig.hidden;
    }

    if (axisConfig.type === ChartAxisTypes.DateAxis && axisConfig.dateFormats) {
      for (const format of axisConfig.dateFormats) {
        (axis as am4charts.DateAxis).dateFormats.setKey(
          format.period,
          format.format
        );
      }
    }
    return axis;
  }

  ngAfterViewInit(): void {
    this.selectedPeriod = ReportPeriods.Week;
    this.zone.runOutsideAngular(() => {
      this.initializeChart();
    });
    this.reloadChart();
  }

  private reloadChart(): void {
    if (!this.chart) {
      return;
    }

    if (this.chartConfig.type !== ChartTypes.Pie) {
      this.chart.series.clear();
      this.chart.data = this.dataSource;
      this.chart.validateData();

      if (!this.dataSource) {
        return;
      }

      if (this.chartConfig.groupBy) {
        const grouped = this.dataSource.reduce((g, o) => {
          const id = o[this.chartConfig.groupBy];
          g[id] = g[id] || [];
          g[id].push(o);
          return g;
        }, {});

        Object.keys(grouped).forEach((key) => {
          this.chartConfig.series.forEach((seriesConfig) => {
            this.chart.series.push(
              this.createSeries(
                seriesConfig,
                this.chartConfig.xAxisConfig,
                this.chartConfig.yAxisConfig,
                grouped[key]
              )
            );
          });
        });
      } else {
        this.chartConfig.series.forEach((seriesConfig) => {
          this.chart.series.push(
            this.createSeries(
              seriesConfig,
              this.chartConfig.xAxisConfig,
              this.chartConfig.yAxisConfig,
              this.dataSource
            )
          );
        });
      }
    } else {
      this.chart.data = this.dataSource;
    }
  }

  export(exportFileNamePrefix?: string, dataFields?: object): void {
    this.chart.exporting.filePrefix = exportFileNamePrefix || 'Export';
    this.chart.exporting.dataFields = dataFields;
    this.chart.exporting.export('xlsx', {
      addColumnNames: true,
    } as am4core.IExportExcelOptions);
  }

  private updateState(): void {
    this.stateChange.emit({
      period: this.selectedPeriod,
      isSelectedAll: this.isSelectedAll,
      selectedItems: this.selectedItems,
    });
  }

  reloadDynamicSelector(): void {
    if (this.dynamicSelector) {
      this.dynamicSelector.reload();
    }
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
