import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-search',
  templateUrl: './icon-search.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconSearchComponent {
  fill: string;
}
