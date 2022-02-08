import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-inventory-rs-import-popup',
  templateUrl: './inventory-rs-import-popup.component.html',
  styleUrls: ['./inventory-rs-import-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryRsImportPopupComponent {
  ranges = [
    { value: 3, label: '3 თვე' },
    { value: 6, label: '6 თვე' },
    { value: 9, label: '9 თვე' },
    { value: 12, label: '12 თვე' }
  ];
  selectedRange: number;

  constructor(
    private dialogRef: MatDialogRef<InventoryRsImportPopupComponent>,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('RS Products Import');
  }

  onApprove(): void {
    this.dialogRef.close(this.selectedRange);
  }

  onDecline(): void {
    this.dialogRef.close();
  }
}
