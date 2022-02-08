import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface DialogData {
  title?: string;
  message?: string;
  templateRef?: TemplateRef<any>;
  approveBtnLabel?: string;
  denyBtnLabel?: string;
}

export function approveAction(dialog: MatDialog, dialogData: DialogData, width: string = '480px'): Observable<boolean> {
  return dialog.open(ApproveDialogComponent, {
    data: dialogData,
    width: width,
  }).afterClosed();
}

@Component({
  selector: 'app-approve-dialog',
  templateUrl: './approve-dialog.component.html',
  styleUrls: ['./approve-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onApprove(): void {
    this.dialogRef.close(true);
  }

  onDecline(): void {
    this.dialogRef.close(false);
  }

  onClose(): void {
    this.dialogRef.close(undefined);
  }
}
