import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-cash-lari',
  templateUrl: './icon-cash-lari.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconCashLariComponent {
  fill: string;
}
