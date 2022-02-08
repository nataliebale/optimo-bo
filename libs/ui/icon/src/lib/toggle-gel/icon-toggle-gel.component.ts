import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-toggle-gel',
  templateUrl: './icon-toggle-gel.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconToggleGelComponent {
  fill: string;
}
