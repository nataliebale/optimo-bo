import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from '@optimo/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input()
  theme: 'light' | 'dark' = 'light';

  @Input()
  isFixed = true;

  @Input()
  requestButtonVisibility = false;

  navItems = [
    {
      title: 'MainNavigation.Home',
      url: '/',
      target: '_self',
    },
    {
      title: 'MainNavigation.Packages',
      url: '/packages',
    },
    {
      title: 'GENERAL.Login',
      externalUrl: 'https://dashboard.optimo.ge',
      target: '_blank',
    },
  ];

  burgerActive = false;
  constructor(
    @Inject(DOCUMENT) private document: any,
    private googleAnalytics: GoogleAnalyticsService,
    public translateService: TranslateService
  ) {
  }

  toggleBurger(): void {
    this.burgerActive = !this.burgerActive;
    const classNameStatus = this.burgerActive ? 'add' : 'remove';
    this.document.body.classList[classNameStatus]('modal-open');
  }

  onRequest(): void {
    this.googleAnalytics.sendEvent('request_order', 'button_click');
  }

  onRequestDemo(): void {
    this.googleAnalytics.sendEvent('request_demo', 'button_click');
  }
}
