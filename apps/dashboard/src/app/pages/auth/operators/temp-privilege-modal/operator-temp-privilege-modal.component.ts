import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddOperatorModalComponent } from '../add-operator-modal/add-operator-modal.component';
import { ClientService } from '@optimo/core';
import {
  catchError,
  exhaustMap,
  throttleTime,
  takeUntil,
} from 'rxjs/operators';
import { EMPTY, Subject, OperatorFunction } from 'rxjs';

@Component({
  selector: 'app-operator-temp-privilege-modal',
  templateUrl: './operator-temp-privilege-modal.component.html',
  styleUrls: ['./operator-temp-privilege-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorTempPrivilegeModalComponent implements OnInit, OnDestroy {
  tempPass = '';

  requestPassword = new Subject<void>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<AddOperatorModalComponent>,
    @Inject(MAT_DIALOG_DATA) private id: number,
    private cdr: ChangeDetectorRef,
    private client: ClientService
  ) {}

  ngOnInit(): void {
    this.requestPassword
      .pipe(
        throttleTime(500),
        this.toHttpGetTempPass,
        catchError(() => {
          this.onClose();
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((tempPass) => {
        if (tempPass) {
          this.tempPass = tempPass;
          this.cdr.markForCheck();
        }
      });
    this.requestPassword.next();
  }

  private get toHttpGetTempPass(): OperatorFunction<void, any> {
    return exhaustMap(() =>
      this.client.get(
        `operators/${this.id}/generateprivilegeelevationpassword`,
        { responseType: 'text' }
      )
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.requestPassword.complete();
  }
}
