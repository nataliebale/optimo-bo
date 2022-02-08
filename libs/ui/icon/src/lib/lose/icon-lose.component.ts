import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-icon-lose',
  templateUrl: './icon-lose.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconLoseComponent {
  @Input()
  fill: string;
}
