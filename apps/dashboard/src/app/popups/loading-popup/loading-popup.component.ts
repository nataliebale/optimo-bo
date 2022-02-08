import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface LoadingData {
  observable: Observable<any>;
  message: string;
}

@Component({
  selector: 'app-loading-popup',
  templateUrl: './loading-popup.component.html',
  styleUrls: ['./loading-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingPopupComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<LoadingPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingData
  ) {}

  ngOnInit(): void {
    this.data?.observable?.pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      console.log('TCL: LoadingPopupComponent -> res', res);
      this.dialogRef.close(res);
    }, () => this.onClose());
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
