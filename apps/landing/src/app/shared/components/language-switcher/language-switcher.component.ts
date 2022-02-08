import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
})
export class LanguageSwitcher implements OnInit {
  constructor(
    public languageService: LanguageService,
    public translateService: TranslateService
  ) {}
  public ngOnInit() {}

  public onLanguageChange(lang: string): void {
    this.languageService.languageChange(lang);
  }
}
