import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-index-column',
  templateUrl: './index-column.component.html',
  styleUrls: ['./index-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexColumnComponent {
  @Input() startIndex: number;
}
