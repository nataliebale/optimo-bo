import { Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationsService } from '../notifications/notifications.service';
import { ErrorCode } from '../../enums/error-codes.enum';
import { IDENTITY_EXCEPTIONS } from './identity-exceptions';
import { DOMAIN_EXCEPTIONS } from './domain-exceptions';
import { ECommandValidationErrorCode } from '../../enums/ECommandValidationErrorCode';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

export class BadRequestHandler {
  constructor(
    private _error: HttpErrorResponse,
    private _notifier: NotificationsService,
    private _defaultErrorMessage: string,
    private _injector: Injector
  ) { }

  
  public static CreateInstance(
    error: HttpErrorResponse,
    notifier: NotificationsService,
    defaultErrorMessage: string,
    injector: Injector
  ): BadRequestHandler {
    return new BadRequestHandler(error, notifier, defaultErrorMessage, injector);
  }


  public Handle(): void {
    if (this.isRefreshRequest(this._error.url)) {
      this.onLogout();
    }
    else if (this._error.error?.Errors?.DomainErrorCodes?.length) {
      this.handleDomainExceptions(
        this._error.error.Errors?.DomainErrorCodes,
        this._notifier
      );
    }
    else if (this._error.error?.errorCode) {
      this.handleIdentityExceptions(this._error.error.errorCode, this._notifier);
    }
    else {
      this._notifier.sayError(this._defaultErrorMessage);
    }
  }


  private onLogout(): void {
    const router: Router = this._injector.get(Router);
    const dialog: MatDialog = this._injector.get(MatDialog);
    const bottomSeet: MatBottomSheet = this._injector.get(MatBottomSheet);
    dialog.closeAll();
    bottomSeet.dismiss();
    router.navigate(['/login']);
  }


  private handleDomainExceptions(
    codes: ECommandValidationErrorCode[],
    notifier: NotificationsService
  ) {
    codes.forEach((code: ECommandValidationErrorCode) => {
      const message = DOMAIN_EXCEPTIONS[code] || this._defaultErrorMessage;
      notifier.sayError(message);
    });
  }


  private handleIdentityExceptions(
    code: ErrorCode,
    notifier: NotificationsService
  ) {
    const message = IDENTITY_EXCEPTIONS[code] || this._defaultErrorMessage;
    notifier.sayError(message);
  }


  private isRefreshRequest(url: string) {
    return url.includes('RefreshAccessToken');
  }
}
