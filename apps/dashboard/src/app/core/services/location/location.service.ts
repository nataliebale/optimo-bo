import { HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ClientService, StorageService } from '@optimo/core';
import decode from 'jwt-decode';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { LocationStatus } from '../../enums/location-status.enum';

export enum LocalStorageKeys {
  locationId = 'locationId',
}

export interface ILocation {
  id: number;
  name: string;
  address: string;
  managerName: string;
  phoneNumber: string;
  status: number;
  statusDescription: number;
  canDelete: boolean;
  isForExtra: boolean;
  autoUploadEntitySalesToRS: boolean;
}

// "id": 0,  // locationMock
// "name": "string",
// "address": "string",
// "managerName": "string",
// "phoneNumber": "string",
// "status": 0,
// "statusDescription": "string",
// "canDelete": true,
// "isForExtra": true,
// "autoUploadEntitySalesToRS": true

@Injectable({
  providedIn: 'root'
})
export class LocationService implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private _selectedId: number;

  private _locations: ILocation[];

  constructor(
    private storage: StorageService,
    private client: ClientService,
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

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

  private fetchLocations(): Observable<ILocation[]> {
    return this.client
      .get('locations', {
        params: new HttpParams({
          fromObject: {
            pageIndex: '0',
            sortField: 'id',
            sortOrder: 'ASC',
            pageSize: '777',
            status: LocationStatus.Enabled.toString(),
          },
        }),
      })
      .pipe(
        takeUntil<{data: ILocation[], totalCount: number}>(this.unsubscribe$),
        map<{data: ILocation[], totalCount: number}, ILocation[]>(locationsResponse => locationsResponse.data),
        tap(locations => this._locations = locations),
      )
  }

  getLocations(): Observable<ILocation[]> {
    return this._locations?.length
      ? of(this._locations)
      : this.fetchLocations()
  }

  makeLocationsEmpty(){
    this._locations = [];
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
