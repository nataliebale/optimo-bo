import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Slide } from './slider.module';

const SLIDER_TIME_DURATION = 3000;

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements AfterViewInit, OnDestroy {
  @Input()
  slides: Slide[];

  private timer: any;
  private isPaused: boolean;
  private activeIndex = 0;

  @HostListener('mouseover')
  onMouseOver() {
    this.isPaused = true;
  }

  @HostListener('mouseout')
  onMouseOut() {
    this.isPaused = false;
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slideToNext();
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.slideToPrevious();
  }

  constructor(
    // tslint:disable-next-line: ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.startSlider();
  }

  slideTo(index: number): void {
    this.activeIndex = index;
    this.cdr.markForCheck();

    this.startSlider();
  }

  private startSlider(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      if (!this.isPaused) {
        this.slideToNext();
      }
    }, SLIDER_TIME_DURATION);
  }

  private slideToNext(): void {
    if (!this.slides) {
      return;
    }

    this.slideTo(
      this.isActive(this.slides.length - 1) ? 0 : this.activeIndex + 1
    );
  }

  private slideToPrevious(): void {
    if (!this.slides) {
      return;
    }

    this.slideTo(
      this.isActive(0) ? this.slides.length - 1 : this.activeIndex - 1
    );
  }

  isActive(i: number): boolean {
    return this.activeIndex === i;
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
