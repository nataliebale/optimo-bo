import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestHandler } from './BadRequestHandler';
@Injectable({
  providedIn: 'root',
})
export class ExceptionHandlerService implements ErrorHandler {
  constructor(private _injector: Injector) {}
  private defaultErrorMessage = 'დაფიქსირდა შეცდომა';
  handleError(error: HttpErrorResponse) {
    if (error instanceof HttpErrorResponse) {
      const notifier: NotificationsService = this._injector.get(
        NotificationsService
      );
      switch (error.status) {
        case 400:
          const badRequestHandler: BadRequestHandler = BadRequestHandler.CreateInstance(
            error,
            notifier,
            this.defaultErrorMessage,
            this._injector
          );
          badRequestHandler.Handle();
          break;
        case 403:
          notifier.sayError('არ გაქვთ საჭირო უფლებები');
          break;
        case 413:
          notifier.sayError('Request Entity Too Large');
          break;
        default:
          notifier.sayError(this.defaultErrorMessage);
          break;
      }
    }
  }
}
