import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CircleProgressComponent } from './circle-progress.component';
import { IconModule } from '@optimo/ui-icon';

@NgModule({
  imports: [CommonModule, IconModule],
  declarations: [CircleProgressComponent],
  exports: [CircleProgressComponent],
})
export class CircleProgressModule {}
