import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { CEOService } from './CEO.service';
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public languages: string[] = ['ka', 'en', 'ru'];
  public defaultLanguage: string = 'ka';

  constructor(
    private _translateService: TranslateService,
    private _router: Router,
    private _CEOService: CEOService
  ) {}

  public init() {
    this._translateService.addLangs(this.languages);
    this._translateService.setDefaultLang(this.defaultLanguage);
    this.listenRouter();
  }

  public languageChange(lang: string): void {
    const urlSegments = this._router.url.split('/');
    urlSegments[1] = lang;
    this._router.navigate([urlSegments.join('/')]);
  }

  private checkLanguage() {
    const urlSegments = this._router.url.split('/');
    const langFromUrl = urlSegments[1];
    const isValidLang = this.languages.includes(langFromUrl);
    if (!isValidLang) {
      this._router.navigate([`/${this.defaultLanguage}`]);
    } else if (langFromUrl !== this._translateService.currentLang) {
      this._translateService
        .use(langFromUrl)
        .toPromise()
        .then(() => {
          this._CEOService.setTitleAndMetaTags();
        });
    } else {
      this._CEOService.setTitleAndMetaTags();
    }
  }

  private listenRouter() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLanguage();
      });
  }
}
