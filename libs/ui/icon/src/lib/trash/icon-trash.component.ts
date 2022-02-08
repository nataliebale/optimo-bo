import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-trash',
  templateUrl: './icon-trash.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconTrashComponent {
  fill: string;
}
