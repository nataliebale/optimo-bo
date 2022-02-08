import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { StorageService } from '@optimo/core';

@Injectable({
  providedIn: 'root',
})
export class UnauthGuard implements CanActivate {
  constructor(private router: Router, private storage: StorageService) {}

  canActivate() {
    const accessToken = this.storage.getAccessToken();
    if (!accessToken) {
      return true;
    }
    this.router.navigate(['/']);
    return false; // this.checkAuth(accessToken);
  }

  // private checkAuth(accessToken: string): Observable<boolean> {
  //   let headers = new HttpHeaders();
  //   headers = headers.append('Authorization', `Bearer ${accessToken}`);

  //   return this.client.get('User/CheckAuth', 'auth-service', headers).pipe(
  //     map(() => {
  //       this.router.navigate(['/']);
  //       return false;
  //     }),
  //     catchError(() => {
  //       this.storage.deleteAccessToken();
  //       return of(true);
  //     })
  //   );
  // }
}
