import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-icon-profit',
  templateUrl: './icon-profit.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconProfitComponent {
  @Input()
  fill: string;
}
