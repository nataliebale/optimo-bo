import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '@optimo/core';
import { LocationService } from '../location/location.service';

@Injectable({
  providedIn: 'root',
})
export class HttpDefaultParamInterceptor implements HttpInterceptor {
  constructor(
    private location: LocationService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.handle(req, next);
  }

  private handle(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    if (!req.params.has('locationId')) {
      req = req.clone({
        setParams: {
          locationId: !this.location.id ? '' : this.location.id.toString(),
        }
      })
    }

    return next.handle(req);
  }
}
