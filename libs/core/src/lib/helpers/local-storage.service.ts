import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private localStorage =
    typeof window !== 'undefined' ? window.localStorage : null;

  set(key: string, value: any): void {
    if (!this.localStorage) {
      return;
    }
    try {
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      this.localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  get(key: string): any {
    if (!this.localStorage) {
      return;
    }
    try {
      let value: string = this.localStorage.getItem(key);
      try {
        value = JSON.parse(value);
      } catch {}
      return value;
    } catch (e) {
      console.error('Error getting data from localStorage', e);
      return undefined;
    }
  }

  remove(key: string): void {
    if (!this.localStorage) {
      return;
    }
    this.localStorage.removeItem(key);
  }
}
