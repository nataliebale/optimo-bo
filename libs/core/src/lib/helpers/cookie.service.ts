import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  constructor(@Inject(PLATFORM_ID) private platformId) {}
  get(key: string, fallback: string = ''): string {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    const name = `${key}=`;
    const cookieString = document.cookie || '';
    const allCookies = cookieString.split(';');

    for (const cookie of allCookies) {
      let result = cookie;
      while (result.charAt(0) === ' ') {
        result = result.substring(1);
      }

      if (result.indexOf(name) === 0) {
        return result.substring(name.length, cookie.length);
      }
    }

    return fallback;
  }

  set(key: string, value: string, time?: number): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    let cookie = `${key}=${value};`;
    if (time) {
      const d = new Date(time);
      const expires = `expires=${d.toUTCString()}`;
      cookie += `${expires};`;
    }
    document.cookie = `${cookie} path=/;`;
  }

  delete(key: string): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
  }
}
