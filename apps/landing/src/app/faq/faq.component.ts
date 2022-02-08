import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FAQ } from './list/faq.model';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
})
export class FaqComponent {
  // tslint:disable-next-line: variable-name
  FAQs: Observable<FAQ[]> = this.route.data.pipe(map(({ FAQs }) => FAQs));

  constructor(
    private route: ActivatedRoute,
    private _translateService: TranslateService
  ) {
    this._translateService.onLangChange.subscribe(() => {
      this.FAQs = this.route.data.pipe(map(({ FAQs }) => FAQs));
    });
  }
}
