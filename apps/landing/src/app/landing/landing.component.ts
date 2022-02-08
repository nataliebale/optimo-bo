import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from '@optimo/core';
import { fromEvent, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
} from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  @ViewChild('videoContainerElement', { static: true })
  videoContainer: ElementRef;

  private scroll$ = fromEvent(this.document, 'scroll', {
    passive: true,
  }).pipe(share());

  scrollThreshold$: Observable<boolean> = this.scroll$.pipe(
    map(() => {
      const fullHeight = this.videoContainer.nativeElement.clientHeight;
      const scrollTop = this.document.documentElement.scrollTop;
      return scrollTop > fullHeight / 1.7;
    }),
    distinctUntilChanged(),
    startWith(false)
  );

  toggleClass$: Observable<'light' | 'dark'> = this.scrollThreshold$.pipe(
    map((state) => (state ? 'light' : 'dark'))
  );

  containerHeight$ = this.scroll$.pipe(
    map(() => {
      const scrollTop = this.document.documentElement.scrollTop;
      return -scrollTop / 2;
    }),
    filter((h) => h > -500),
    distinctUntilChanged(),
    startWith(0)
  );

  constructor(
    @Inject(DOCUMENT) private document: any,
    // tslint:disable-next-line:ban-types
    @Inject(PLATFORM_ID) private platformId: Object,
    private googleAnalytics: GoogleAnalyticsService,
    public translateService: TranslateService
  ) {}

  scrollDown(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.scrollTo({
      top: this.videoContainer.nativeElement.clientHeight - 350,
      behavior: 'smooth',
    });
  }

  play(el: ElementRef): void {
    el.nativeElement.play();
  }

  onRequest(): void {
    this.googleAnalytics.sendEvent('request_order', 'button_click');
  }

  onRequestDemo(): void {
    this.googleAnalytics.sendEvent('request_demo', 'button_click');
  }
}
