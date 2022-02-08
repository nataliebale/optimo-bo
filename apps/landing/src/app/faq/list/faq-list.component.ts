import { ViewportScroller } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CollapseData } from '../../shared/components/collapse/collapse.component';
import { FAQ } from './faq.model';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
})
export class FaqListComponent implements OnInit, OnDestroy {
  @Input()
  // tslint:disable-next-line: variable-name
  set FAQs(value: FAQ[]) {
    this.list = value.map((item) => this.mapFAQ(item));
  }
  list: CollapseData[];

  private _activeFAQSlug: string;

  set activeFAQSlug(value: string) {
    this._activeFAQSlug = value;
  }

  get activeFAQSlug(): string {
    return this._activeFAQSlug;
  }

  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    private _translateService: TranslateService
  ) {}

  mapFAQ(faq: FAQ): CollapseData {
    switch (this._translateService.currentLang) {
      case 'en':
        return {
          id: faq.urlSlug,
          title: faq.questionENG,
          content: faq.answerENG,
        };
      case 'ru':
        return {
          id: faq.urlSlug,
          title: faq.questionRUS,
          content: faq.answerRUS,
        };
      default:
        return {
          id: faq.urlSlug,
          title: faq.questionGEO,
          content: faq.answerGEO,
        };
    }
  }

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((fragment) => !!fragment)
      )
      .subscribe((fragment) => {
        this.activeFAQSlug = fragment;
        setTimeout(() => {
          // for dynamic load content
          this.viewportScroller.scrollToAnchor(fragment);
        });
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
