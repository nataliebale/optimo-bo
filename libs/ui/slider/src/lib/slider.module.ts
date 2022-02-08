import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderComponent } from './slider.component';
import { RouterModule } from '@angular/router';

export interface Slide {
  img: string;
  routePath?: string;
  alt: string;
}

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [SliderComponent],
  exports: [SliderComponent],
})
export class SliderModule {}
