import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-icon-trash-tbls',
  templateUrl: './icon-trash-tbls.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconTrashTblsComponent {
  fill: string;
}
