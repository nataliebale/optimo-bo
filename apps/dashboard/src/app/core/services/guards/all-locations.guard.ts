import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '@optimo/core';
import { LocationService } from '../location/location.service';

@Injectable({
  providedIn: 'root',
})
export class AllLocationsGuard implements CanActivate {
  constructor(
    private router: Router,
    private location: LocationService,
  ) {}

  canActivate() {
    // console.log('AllLocationsGuard -> canActivate -> locationId', locationId);
    if (this.location.id !== 0) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
