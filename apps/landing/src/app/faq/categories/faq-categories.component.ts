import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language.service';
import { CATEGORIES_MOCK, Category } from './category.model';

@Component({
  selector: 'app-faq-categories',
  templateUrl: './faq-categories.component.html',
})
export class FaqCategoriesComponent {
  constructor(public translateService: TranslateService){}
  categories: Category[] = CATEGORIES_MOCK.sort(
    (a, b) => a.sortIndex - b.sortIndex
  );
}
