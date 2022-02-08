import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as mixpanel from 'mixpanel-browser';
import { IMixpanelUser } from '../models/IMixpanelUser';

@Injectable({
  providedIn: 'root',
})
export class MixpanelService {
  private _isLocal: boolean;
  private _userIsForTesting: boolean;
  private _token: string;
  constructor(@Inject(DOCUMENT) private _document) {
    const hostname: string = this._document.location.hostname;
    this._isLocal = hostname === '127.0.0.1' || hostname === 'localhost';
  }

  private disableTracking() {
    return this._userIsForTesting || this._isLocal || !this._token;
  }

  public init(token: string): void {
    this._token = token;
    if (this.disableTracking()) return;
    if (this._isLocal || !token) return;
    mixpanel.init(token);
  }

  public identify(user: IMixpanelUser, userIdentifier: string): void {
    this._userIsForTesting = user.isForTesting;
    if (this.disableTracking()) return;
    if (this._isLocal) return;
    mixpanel.identify(userIdentifier);
    mixpanel.people.set(user);
  }

  public track(eventName: string, payload: object = {}): void {
    if (this.disableTracking()) return;
    mixpanel.track(eventName, payload);
  }

  public reset(): void {
    mixpanel.reset();
  }

  public trackPageView(pageName: string): void {
    setTimeout(() => {
      this.track(pageName);
    }, 1000);
  }

}
