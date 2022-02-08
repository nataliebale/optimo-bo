import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root',
})
export class CEOService {
  constructor(
    private _translateService: TranslateService,
    private _route: ActivatedRoute,
    private _titleService: Title,
    private _metaService: Meta
  ) {}

  public setTitleAndMetaTags() {
    const params = this._route.root.firstChild.snapshot.data as {
      title: string;
      meta: string;
    };
    const title: string =
      this._translateService.instant(params.title) + ' - Optimo';
    const metaContent: string = this._translateService.instant(params.meta);
    this._titleService.setTitle(title);
    this._metaService.updateTag({
      name: 'description',
      content: metaContent,
    });
  }
}
