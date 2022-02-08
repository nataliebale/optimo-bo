import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private messageSource = new BehaviorSubject('default message');
  locationsChange = this.messageSource.asObservable();

  constructor() { }

  locationsUpdated() {
    this.messageSource.next('updated message');
  }
}
