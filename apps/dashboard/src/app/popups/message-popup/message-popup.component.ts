import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// export interface MessageData {
//   message: string;
//   btnLabel?: string;
// }
@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagePopupComponent {
  constructor(
    private dialogRef: MatDialogRef<MessagePopupComponent>
  ) // @Inject(MAT_DIALOG_DATA) public data: MessageData
  {}

  onClose(): void {
    this.dialogRef.close();
  }
}
