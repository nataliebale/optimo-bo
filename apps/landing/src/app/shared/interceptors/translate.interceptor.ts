import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import * as express from 'express';
import { Inject } from '@angular/core';
@Injectable()
export class TranslateInterceptor implements HttpInterceptor {
  private readonly PORT = process.env.PORT || '';

  constructor(@Inject(REQUEST) private request: express.Request) {}

  getBaseUrl(req: express.Request) {
    const { protocol } = req;
    return `${protocol}://localhost:${this.PORT}`;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    if (request.url.startsWith('./assets')) {
      const baseUrl = this.getBaseUrl(this.request);
      request = request.clone({
        url: `${baseUrl}/${request.url.replace('./assets', 'assets')}`,
      });
    }
    return next.handle(request);
  }
}
