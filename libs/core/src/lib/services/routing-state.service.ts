import { Injectable, Inject } from '@angular/core';
import {
  Router,
  NavigationEnd,
  UrlTree,
  NavigationCancel,
  ActivatedRoute,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { filter, tap, map } from 'rxjs/operators';
import { GoogleAnalyticsService } from './google-analytics.service';
import { CoreLibConfig } from '../core.module';
import { PageTitleService } from './page-title.service';
import { SidebarStateService } from './sidebar-state.service';

@Injectable({
  providedIn: 'root',
})
export class RoutingStateService {
  private history: string[] = [];
  private canceledURL: string;
  private loaded: boolean;

  private _trackGoogleAnalitics: boolean;
  private _MENU_TREE: boolean;

  constructor(
    private router: Router,
    private gtmService: GoogleAnalyticsService,
    private titleService: PageTitleService,
    @Inject('CONFIG') private config: CoreLibConfig,
    private sidebarService: SidebarStateService,
    private activatedRoute: ActivatedRoute
  ) {}

  loadRouting(): void {
    if (this.loaded) {
      return;
    }
    this.router.events
      .pipe(
        tap((event) => {
          if (event instanceof NavigationCancel) {
            this.canceledURL = event.url;
          }
        }),
        filter((event) => event instanceof NavigationEnd),
        // tap((event) => console.log('dev => NavEnd', event)),
        map((event: NavigationEnd) => {
          const [mainPath] = event.urlAfterRedirects.split('?');

          const subRouts = mainPath.split('/');

          return {
            url: event.url,
            urlAfterRedirects: event.urlAfterRedirects,
            mainPath,
          };
        })
      )
      .subscribe((event) => {
        this.history.unshift(event.urlAfterRedirects);
        this.history.length = 4;
        if (this._trackGoogleAnalitics) {
          this.gtmService.pageView(event.url);
        }
        if (this._MENU_TREE) {
          this.findAndSetPageTitleRecursive(this._MENU_TREE, event.mainPath);
        }

        this.tagHotjarPage();
      });
    this.loaded = true;
  }

  private tagHotjarPage() {
    const lastRouteEventName = this.findLastChildData(
      this.activatedRoute.snapshot,
      'hotjarEventName'
    );
    lastRouteEventName ? this.tagHotjarEvent(lastRouteEventName) : null;
  }

  public tagHotjarEvent(eventName: string) {
    this.getHotjarInstance()('event', eventName);
  }

  // recuresively finds last occurence of data param inside router tree
  private findLastChildData(
    route: ActivatedRouteSnapshot,
    dataName: string
  ): any {
    if (!route) return null;
    const curRouteData = route.data[dataName] ?? null;
    return this.findLastChildData(route.firstChild, dataName) ?? curRouteData;
  }

  trackGoogleAnalitics(): void {
    this._trackGoogleAnalitics = !!this.config.gtagId;
  }

  updatePageTitle(menuTree: any): void {
    this._MENU_TREE = menuTree;
  }

  private findAndSetPageTitleRecursive(menuTree, routePath: string) {
    if (routePath.startsWith('/login')) {
      this.titleService.updateTitle('ოპტიმო');
      return false;
    }
    return menuTree.find((item) => {
      if (routePath.startsWith(item.path)) {
        this.titleService.updateTitle(item.pageName || item.text, 'ოპტიმო');
        this.sidebarService.updateActiveMenuItem(item);
        return false;
      } else if (item.children) {
        this.findAndSetPageTitleRecursive(item.children, routePath);
        return false;
      }
      return false;
    });
  }

  getHistory(): string[] {
    return this.history;
  }

  getPreviousUrl(): string {
    return this.history[1];
  }

  removePreviousUrl(): string {
    return this.history.shift();
  }

  getPreviousUrlTree(): UrlTree {
    const url = this.getPreviousUrl();
    return url && this.router.parseUrl(url);
  }

  getPreviousCanceledUrl(): string {
    return this.canceledURL;
  }

  getPreviousCanceledUrlTree(): UrlTree {
    const url = this.getPreviousCanceledUrl();
    return url && this.router.parseUrl(url);
  }

  private parseQueryString(queryString: string): object {
    return JSON.parse(
      '{"' +
        decodeURI(queryString)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}'
    );
  }

  getHotjarInstance(): (event: string, args: any) => void {
    return window['hj'];
  }

  public trackHotjar(eventName: string): void {
    return window['hj']('event', eventName);
  }
}
