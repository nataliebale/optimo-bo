import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoreLibConfig } from '../core.module';
import { StorageService } from './storage.service';

type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

export enum Service {
  Main,
  Auth,
  Reporting,
  FullUrl,
}

export interface RequestOptions {
  service?: Service | string;
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: ResponseType;
  observe?: 'response' | 'body';
}

export type PostRequestOptions = RequestOptions & { file?: boolean };

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(
    private http: HttpClient,
    @Inject('CONFIG') private config: CoreLibConfig,
    private storage: StorageService
  ) {}

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    if (!options) {
      options = {};
    }
    options.observe = this.observe(options.responseType);

    if (!options.params) {
      options.params = new HttpParams();
    }

    options.params = options.params.append(
      'timeZoneOffset',
      new Date().getTimezoneOffset().toString()
    );

    if (options?.service === Service.Auth) {
      options.params = options.params.append('userType', this.config.appType);
    }

    return this.http.get<T>(
      this.getURL(path, options?.service),
      options as object
    );
  }

  post<T>(
    path: string,
    data?: object,
    options?: PostRequestOptions
  ): Observable<T> {
    if (!options) {
      options = {};
    }
    options.observe = this.observe(options.responseType);

    if (!options.params) {
      options.params = new HttpParams();
    }
    options.params = options.params.append(
      'timeZoneOffset',
      new Date().getTimezoneOffset().toString()
    );

    if (options?.service === Service.Auth) {
      options.params = options.params.append('userType', this.config.appType);
    }

    return this.http.post<T>(
      this.getURL(path, options?.service),
      options.file ? data : { ...data },
      options as object
    );
  }

  put<T>(path: string, data?: object, options?: RequestOptions): Observable<T> {
    if (!options) {
      options = {};
    }
    options.observe = this.observe(options.responseType);

    if (!options.params) {
      options.params = new HttpParams();
    }
    options.params = options.params.append(
      'timeZoneOffset',
      new Date().getTimezoneOffset().toString()
    );

    return this.http.put<T>(
      this.getURL(path, options?.service),
      { ...data },
      options as object
    );
  }

  delete<T>(
    path: string,
    data?: object,
    options?: RequestOptions
  ): Observable<T> {
    if (!options) {
      options = {};
    }

    (options as any).body = data;

    if (!options.params) {
      options.params = new HttpParams();
    }
    options.params = options.params.append(
      'timeZoneOffset',
      new Date().getTimezoneOffset().toString()
    );

    return this.http.delete<T>(
      this.getURL(path, options?.service),
      options as object
    );
  }

  // patch<T>(
  //   path: string,
  //   data?: object,
  //   options?: RequestOptions
  // ): Observable<T> {
  //   if (!options) {
  //     options = {};
  //   }
  //   options.observe = this.observe(options.responseType);

  //   if (!options.params) {
  //     options.params = new HttpParams();
  //   }
  //   options.params = options.params
  //     .append('timeZoneOffset', new Date().getTimezoneOffset().toString())
  //     .append('locationId', this.storage.locationId.toString());

  //   return this.http.patch<T>(
  //     this.getURL(path, options?.service),
  //     { ...data, locationId: this.storage.locationId },
  //     options as object
  //   );
  // }

  private getURL(path: string, service: Service | string): string {
    if (!service) {
      return this.config.mainRoute + path;
    }

    switch (service) {
      case Service.Main:
        return this.config.mainRoute + path;
      case Service.Auth:
        return this.config.authRoute + path;
      case Service.Reporting:
        return this.config.reportingRoute + path;
      case Service.FullUrl:
        return path;
      default:
        return service + path;
    }
  }

  private observe(responseType: ResponseType) {
    return responseType === 'blob' ? 'response' : 'body';
  }
}
