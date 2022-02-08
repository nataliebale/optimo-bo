import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-received-waybill-edit-save-dialog',
  templateUrl: './received-waybill-edit-save-dialog.component.html',
  styleUrls: ['./received-waybill-edit-save-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceivedWaybillEditSaveDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ReceivedWaybillEditSaveDialogComponent>
  ) {}

  on(action: 'new' | 'existing'): void {
    this.dialogRef.close(action);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
