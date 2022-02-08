export enum ChartTypes {
  Pie,
  XY,
}

export enum ChartSeriesTypes {
  Pie,
  Column,
  Line,
}

export interface ChartSeries {
  keyField: string;
  valueField: string;
  colorField?: string;
  type: ChartSeriesTypes;
  stacked?: boolean;
  color?: string;
  text?: string;
  hidden?: boolean;
  columnRadius?: number;
  tooltipText?: string;
  bullets?: boolean;
  criticalValueField?: string;
  criticalValueColor?: string;
}

export enum ChartAxisTypes {
  DateAxis,
  ValueAxis,
  CategoryAxis,
}

export interface AxisConfig {
  type: ChartAxisTypes;
  title?: string;
  endToEnd?: boolean;
  hidden?: boolean;
  dateFormats?: [
    {
      period:
        | 'millisecond'
        | 'second'
        | 'minute'
        | 'hour'
        | 'day'
        | 'week'
        | 'month'
        | 'year';
      format: string;
    }
  ];
  labelWrap?: boolean;
  labelMaxWidth?: number;
  disableGrid?: boolean;
  minGridDistance?: number;
  startLocation?: number;
  labelFontSize?: number;
  labelFontWeight?:
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  labelRotation?: number;

  titleFontSize?: number;
  titleFontWeight?:
    | 'normal'
    | 'bold'
    | 'bolder'
    | 'lighter'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';

  gridMinValue?: number;
  gridMaxValue?: number;
}

export interface ChartConfig {
  type: ChartTypes;
  series: ChartSeries[];

  cursor?: boolean;

  legend?: boolean;
  legendPosition?: 'right' | 'left' | 'bottom' | 'top';
  groupBy?: string;
  innerRadius?: number;

  xAxisConfig?: AxisConfig;
  yAxisConfig?: AxisConfig;

  colors?: string[];
}

export enum ReportPeriods {
  Year = 365,
  Quarter = 63,
  Month = 31,
  Week = 7,
  Day = 1,
}
