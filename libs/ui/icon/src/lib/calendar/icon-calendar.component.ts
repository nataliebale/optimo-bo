import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-icon-calendar',
  templateUrl: './icon-calendar.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconCalendarComponent {
  @Input()
  fill: string;
}
