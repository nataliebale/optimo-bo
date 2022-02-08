import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-link-open',
  templateUrl: './icon-link-open.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconLinkOpenComponent {
  fill: string;
}
