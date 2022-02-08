import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { NotificationsService } from '../notifications/notifications.service';
import { ErrorCodeDetectorService } from '../error-code-detector/error-code-detector.service';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ErrorCode } from '../../enums/error-codes.enum';
import { ECommandValidationErrorCode } from '../../enums/ECommandValidationErrorCode';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificator: NotificationsService,
    private errorCodeDetector: ErrorCodeDetectorService,
    private dialog: MatDialog,
    private bottomSeet: MatBottomSheet
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.handle(req, next);
  }

  private handle(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (req.headers.get("skip"))
      return next.handle(req);

    return next.handle(req).pipe(
      catchError((err) => {
        console.log('error', err);
        this.checkError(err);
        return of(null);
      })
    );
  }

  private checkError(err: HttpErrorResponse) {
    console.log('I am here and i handled an error: ', err);
    switch (err.status) {
      case 400:
        if (this.isRefreshRequest(err.url)) {
          this.onLogout();
        } else {
          this.checkErrorCode(err);
        }
        break;
      case 403:
        this.showForbiddenMessage();
        break;
      case 413:
        this.showTooLargeEntryMessage();
        break;
      case 500:
        this.showRequestErrorMessage();
        break;
      // default:
      //   this.showRequestErrorMessage();
      //   break;
    }
    throw err;
  }

  private onLogout(): void {
    this.dialog.closeAll();
    this.bottomSeet.dismiss();
    this.router.navigate(['/login']);
  }

  private checkErrorCode(err: HttpErrorResponse) {
    if (this.hasCode(err)) {
      this.showErrorMessage(err);
    } else if(this.hasDomainErrors(err)) {
      // If there is no error code, it's just invalid request error 400.
      this.showDomainError(err);
    } else {
      // If there is no error code, it's just invalid request error 400.
      this.showDefaultMessage();
    }
  }

  private showDomainError(err: HttpErrorResponse) {
    if (
      err.error.Errors?.DomainErrorCodes.includes(
        ECommandValidationErrorCode.DuplicatedCategoryName
      ) ||
      err.error.Errors?.DomainErrorCodes.includes(
        ECommandValidationErrorCode.ShiftIsNotClosed
      )
    ) {
      return;
    } else {
      this.showDefaultMessage();
    }
  }

  private hasDomainErrors(err: HttpErrorResponse) {
    return err.error.Errors?.DomainErrorCodes?.length;
  }

  private hasCode(err: HttpErrorResponse) {
    return err.error && err.error.errorCode !== undefined;
  }

  private showErrorMessage(err: HttpErrorResponse) {
    if (
      err.error.errorCode === ErrorCode.PasswordResetPendingException ||
      err.error.errorCode === ErrorCode.MultipleLegalEntitiesException ||
      err.error.errorCode === ErrorCode.ContractAgreementMissingException||
      err.error.errorCode === ErrorCode.DuplicatedCategoryName
    ) {
      return;
    }
    const errorMessage = this.errorCodeDetector.getErrorMessage(
      err.error.errorCode
    );
    this.notificator.sayError(errorMessage);
  }

  private showDefaultMessage() {
    this.notificator.sayError('დაფიქსირდა შეცდომა');
  }

  private showRequestErrorMessage() {
    this.notificator.sayError('დაფიქსირდა შეცდომა');
  }

  private showForbiddenMessage() {
    this.notificator.sayError('არ გაქვთ საჭირო უფლებები');
  }

  private showTooLargeEntryMessage() {
    this.notificator.sayError('Request Entity Too Large.');
  }

  private isRefreshRequest(url: string) {
    return url.includes('RefreshAccessToken');
  }
}
