import { EReportType } from './EReportType';
export interface IReportTab {
  title?: string;
  value?: number;
  type?: EReportType;
  active?: boolean;
  sum?: number;
  sumPercentage?: number;
  disable?: boolean;
  show?: boolean;
}
