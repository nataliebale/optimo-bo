import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Inject,
  ChangeDetectorRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientService, StorageService, RoleService } from '@optimo/core';
import { LocationStatus } from 'apps/dashboard/src/app/core/enums/location-status.enum';
import { EventBusService } from 'apps/dashboard/src/app/core/services/event-bus-service/event-bus.service';
import { LocationService } from 'apps/dashboard/src/app/core/services/location/location.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-headbar-location',
  templateUrl: './headbar-location.component.html',
  styleUrls: ['./headbar-location.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadbarLocationComponent implements OnInit, OnDestroy {
  isExpanded: boolean;
  locations: any[];
  locationAll = {
    id: 0,
    name: 'ყველა'
  };
  selectedLocation: any;
  searchName: string = '';
  allLocations: boolean = false;
  locationsArrayLength = 1;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    @Inject(DOCUMENT) protected document: any,
    private client: ClientService,
    private storage: StorageService,
    private cdr: ChangeDetectorRef,
    private eventBus: EventBusService,
    public roleService: RoleService,
    private location: LocationService
  ) {
  }

  ngOnInit(): void {
    this.eventBus.locationsChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.getLocations();
      });
    this.define_ALL_location();
  }

  private getLocations(): void {
    this.location.getLocations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.locations = data;
        if (this.location.id === 0 && this.roleService.isUser(['BO'])) {
          this.selectedLocation = this.locationAll;
        } else {
          this.selectedLocation =
            this.locations.find(
              (location) => location.id === this.location.id
            ) || this.locations[0];
        }
        this.cdr.markForCheck();
      });
  }

  onLocationChange(location: any): void {
    console.log('onLocationChange -> location', location);
    // this.storage.set('locationId', location.id);
    this.location.id = location.id;
    window.location.reload();
  }

  onToggleExpanded(needEvent, e) {
    if (needEvent && e['target'] !== undefined) {
      this.isExpanded = e['target']['localName'] !== 'input' ? !this.isExpanded : true;
    } else {
      this.isExpanded = false;
      this.restoreLocationsListToDefault();
    }

    this.cdr.markForCheck();
    if (needEvent && e) {
      e.stopPropagation();
      if (this.isExpanded && e['target']['localName'] !== 'input') {
        this.restoreLocationsListToDefault();
        this.document.getElementsByTagName('html')[0].click();
      }
    }

  }
  private restoreLocationsListToDefault(){
    this.searchName = '';
    this.locationsArrayLength = 1;
    this.define_ALL_location();
  }
  search(event) {
    this.searchName = event['target']['value'];
    this.define_ALL_location(event);
    if(!this.allLocations){
      this.locationsArrayLength = event['target']['value'].length!==0 ? 0 : 1;
    }else{
      this.locationsArrayLength = 1;
    }
  }

  sortByName(locations, value) {
    if ( value.length !== 0) {
        this.locationsArrayLength = 0;
        return locations.map(location => {
          if (location['name'].toLowerCase().includes(value.toLowerCase())) {
            this.locationsArrayLength = 1;
            return location;
          }else {
            if(this.allLocations){
              this.locationsArrayLength = 1;
            }
          }
        });
    } else {
        return locations;
    }
  }

  private define_ALL_location(event?){
    if(this.translateService.instant('LOCATIONS')['ALL_LOCATION']!==undefined){
      if(event){
        this.allLocations = this.translateService.instant('LOCATIONS')['ALL_LOCATION'].toLowerCase().includes(event['target']['value'].toLowerCase());
      }else{
        this.allLocations = true;
      }
    }else{
      this.allLocations = false;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
