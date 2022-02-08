import { Injectable, Inject } from '@angular/core';
import { CoreLibConfig } from '../core.module';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  constructor(@Inject('CONFIG') private config: CoreLibConfig) {}

  sendEvent(
    eventCategory: string,
    eventAction: string,
    eventLabel?: string,
    eventValue?: number
  ): void {
    try {
      gtag('send', 'event', {
        eventCategory,
        eventLabel,
        eventAction,
        eventValue,
      });
    } catch {}
  }

  pageView(url: string): void {
    try {
      gtag('config', this.config.gtagId, {
        page_path: url,
      });
      // gtag('set', 'page', url);
      // gtag('send', 'pageview');
    } catch {}
  }
}
