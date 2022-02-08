import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SidebarStateService {

  private _selectedMenuObserver = new BehaviorSubject<any>(null);

  public updateActiveMenuItem(menuItem: any){
    this._selectedMenuObserver.next(menuItem);
  }

  public get selectedMenuItem(): BehaviorSubject<any> {
    return this._selectedMenuObserver;
  }

  constructor(
  ) {}
}