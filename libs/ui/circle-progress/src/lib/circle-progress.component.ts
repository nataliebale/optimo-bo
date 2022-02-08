import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-circle-progress',
  templateUrl: './circle-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CircleProgressComponent {
  @Input()
  startColor: string;

  @Input()
  endColor: string;

  @Input()
  icon: string;

  @Input()
  active: boolean;

  id = `gradient-${Math.random()}`;
}
