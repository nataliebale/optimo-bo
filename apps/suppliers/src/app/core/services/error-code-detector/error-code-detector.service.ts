import { Injectable } from '@angular/core';

import { ERROR_CODE } from './error-code.mock';
import { ErrorCode } from '../../enums/error-codes.enum';

@Injectable({
  providedIn: 'root',
})
export class ErrorCodeDetectorService {
  constructor() {}

  public getErrorMessage(errorCode) {
    const enumStringKey = ErrorCode[errorCode];

    if (enumStringKey) {
      return ERROR_CODE[enumStringKey];
    }

    return `მოხდა შეცდომა (კოდი: ${errorCode})`;
  }
}
