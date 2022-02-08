import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { ChartComponent } from '../chart.component';

@Component({
  selector: 'app-chart-export',
  templateUrl: './chart-export.component.html',
  styleUrls: ['./chart-export.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartExportComponent {
  @Input()
  chart: ChartComponent;

  @Input()
  fileNamePrefix: string;

  @Input()
  trackActions: [() => void];

  @Input()
  mapsOfColumnTitle: object;

  export(): void {
    if (this.trackActions) this.trackActions[0]();
    this.chart.export(this.fileNamePrefix, this.mapsOfColumnTitle);
  }
}
