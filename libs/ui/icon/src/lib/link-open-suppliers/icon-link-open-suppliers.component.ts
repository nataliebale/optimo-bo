import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-icon-link-open-suppliers',
  templateUrl: './icon-link-open-suppliers.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLinkOpenSuppliersComponent {
  fill: string;
}
