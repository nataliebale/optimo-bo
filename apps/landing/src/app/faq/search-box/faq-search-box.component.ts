import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from '@optimo/core';
import { Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FAQ } from '../list/faq.model';

@Component({
  selector: 'app-faq-search-box',
  templateUrl: './faq-search-box.component.html',
})
export class FaqSearchBoxComponent {
  suggestionInput$ = new Subject<string>();
  suggestionLoading: boolean;

  suggestions$ = this.suggestionInput$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    tap(() => {
      this.suggestionLoading = true;
    }),
    switchMap((term) =>
      this.search$(term).pipe(
        tap(() => {
          this.suggestionLoading = false;
        })
      )
    )
  );

  constructor(
    private client: ClientService,
    private router: Router,
    private _translateService: TranslateService
  ) {}

  public get bindLabel(): string {
    switch (this._translateService.currentLang) {
      case 'ru':
        return 'questionRUS';
      case 'en':
        return 'questionENG';
      default:
        return 'questionGEO';
    }
  }

  onSelectFAQ(faq: FAQ): void {
    if (!faq) {
      return;
    }
    this.router.navigate(
      [`${this._translateService.currentLang}/faq`, faq.category.urlSlug],
      {
        fragment: faq.urlSlug,
      }
    );
  }

  private search$(term: string): Observable<FAQ[]> {
    if (!term) {
      return of([]);
    }
    return this.client
      .get<FAQ[]>('FAQs/search', {
        params: new HttpParams({ fromObject: { searchText: term } }),
      })
      .pipe(
        catchError(() => of([])) // empty list on error
      );
  }

  trackByFn(item: FAQ) {
    return item.sortIndex;
  }
}
