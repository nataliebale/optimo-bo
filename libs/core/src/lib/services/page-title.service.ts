import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PageTitleService {

  private _titleObserver = new BehaviorSubject<string>('');

  public updateTitle(title: string, extention?: string){
    const newTitle = extention ? `${title} - ${extention}` : title;
    this.titleService.setTitle(newTitle);
    this._titleObserver.next(title);
  }

  public get titleObserver(): BehaviorSubject<string> {
    return this._titleObserver;
  }

  constructor(
    private titleService: Title,
  ) {}
}