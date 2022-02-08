import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserIdleService } from 'angular-user-idle';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

export enum IdleActions {
  Continue,
  Logout,
  Timeout
}

@Component({
  selector: 'app-idle-popup',
  templateUrl: './idle-popup.component.html',
  styleUrls: ['./idle-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdlePopupComponent implements OnInit, OnDestroy {
  countDown = 59;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<IdlePopupComponent>,
    private userIdle: UserIdleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userIdle.ping$
      .pipe(take(59), takeUntil(this.unsubscribe$))
      .subscribe(() => {
        if (!--this.countDown) {
          this.onTimeout();
        }
        this.cdr.markForCheck();
      });
  }

  private onTimeout(): void {
    this.dialogRef.close(IdleActions.Timeout);
  }

  onLogout(): void {
    this.dialogRef.close(IdleActions.Logout);
  }

  onContinue(): void {
    this.dialogRef.close(IdleActions.Continue);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
