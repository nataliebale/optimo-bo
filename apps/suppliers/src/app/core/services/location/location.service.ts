import { Injectable } from '@angular/core';
import { StorageService } from '@optimo/core';
import decode from 'jwt-decode';

export enum LocalStorageKeys {
  locationId = 'locationId',
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _selectedId: number;

  constructor(
    private storage: StorageService
  ) { }

  get id(): number {// toString is needed because location can be empty string.
    // console.log('dev => locationId => accessToken:', this.storage.getAccessToken());
    if (!this._selectedId?.toString) {
      if (!this.storage.getAccessToken()) return 1;
      this._selectedId = this.storage.get(LocalStorageKeys.locationId);
      if (!this._selectedId?.toString) this.initLocation();
    }
    return this._selectedId;
  }

  set id(locationId: number) {
    this.storage.set(LocalStorageKeys.locationId, locationId);
    this._selectedId = locationId;
  }

  initLocation() {
    /**
     * This code is temporary placed here. it should be moved in separated service 
     * for locations management.
     * 
     * In general what this code does is that when user logs in and it's role is Staff, in localstorage 
     * locationId must be set the first of permissions array.
     * if it's BO, default is 1
     */
    const accessToken: string = this.storage.getAccessToken();
    if(!accessToken) return;
    const decodeAccessToken: Array<{}> = decode(accessToken);
    const userRoleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const userRole: string = decodeAccessToken[userRoleKey];

    if (!this.storage.get('locationId')) {

      if (userRole === 'Staff') {

        const userPermissions = JSON.parse(decodeAccessToken['permissions']);
  
        if (userPermissions.length > 0) {
  
          const firstUserPermission: {} = userPermissions[0]['locationId'];
          this.storage.set('locationId', firstUserPermission);
        }
        else {
          this.storage.set('locationId', 1);
        }
      } else {
        this.storage.set('locationId', 1);
      }
    }
    this.id = this.storage.get('locationId');
  }

  // removes location from storage, needed when location is deleted
  resetLocation() {
    this.storage.remove(LocalStorageKeys.locationId);
    this._selectedId = undefined;
  }

  // unsets current location used for logout
  unsetLocation() {
    this._selectedId = undefined;
  }
}
