import { Injectable } from '@angular/core';
import { Router, CanLoad, CanActivate } from '@angular/router';
import { StorageService } from '@optimo/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanLoad, CanActivate {
  constructor(public router: Router, private storage: StorageService) {}

  canActivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.isAuthed;
  }

  canLoad(): boolean | Observable<boolean> | Promise<boolean> {
    return this.isAuthed;
  }

  private get isAuthed(): boolean {
    const accessToken = this.storage.getAccessToken();

    if (!accessToken) {
      this.goToLogin();
      return false;
    }

    return true; // this.checkAuth(accessToken);
  }

  // private checkAuth(accessToken: string): Observable<boolean> {
  //   let headers = new HttpHeaders();
  //   headers = headers.append('Authorization', `Bearer ${accessToken}`);

  //   return this.client.get('User/CheckAuth', 'auth-service', headers).pipe(
  //     mapTo(true),
  //     catchError(() => {
  //       this.storage.deleteAccessToken();
  //       this.goToLogin();
  //       return of(false);
  //     })
  //   );
  // }

  private goToLogin() {
    this.router.navigate(['login']);
  }
}
