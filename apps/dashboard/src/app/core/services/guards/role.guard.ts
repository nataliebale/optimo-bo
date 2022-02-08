import { Injectable } from '@angular/core';
import decode from 'jwt-decode';
import { CanLoad, Router, ActivatedRoute, CanActivate } from '@angular/router';
import { StorageService } from '@optimo/core';
import { MatDialog } from '@angular/material/dialog';
import { PackagePopupComponent } from 'apps/dashboard/src/app/popups/package-popup/package-popup.component';
import { PackageType } from '../../enums/package-type.enum';

@Injectable({providedIn: 'root'})
export class RoleGuard implements CanLoad, CanActivate {
  constructor(
    private router: Router,
    private storage: StorageService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  canLoad(): boolean {
    return this.hasRole;
  }

  canActivate(): boolean {
    return this.hasRole;
  }

  private get hasRole(): boolean {
    const accessToken = this.storage.getAccessToken();

    if (!accessToken) {
      this.router.navigate(['login']);
      return false;
    }

    const tokenPayload = decode(accessToken);

    // console.log('dev => role.guard => tokenPayload', tokenPayload);

    if (this.isBasic(tokenPayload)) {
      if (!this.route.snapshot.component) {
        this.router.navigate(['/']);
      }
      this.openPopup();
      return false;
    }

    return true;
  }

  private isBasic(tokenPayload: any): boolean {
    return tokenPayload.PackageType === PackageType.Basic;
  }

  private openPopup(): void {
    this.dialog.open(PackagePopupComponent, {
      width: '800px',
    });
  }
}
