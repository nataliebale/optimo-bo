import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '@optimo/core';

@Injectable({
  providedIn: 'root',
})
export class ChangePasswordGuard implements CanActivate {
  constructor(private router: Router, private storage: StorageService) {}

  canActivate() {
    const firstLogin = this.storage.get('firstLogin', true);
    if (firstLogin) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
