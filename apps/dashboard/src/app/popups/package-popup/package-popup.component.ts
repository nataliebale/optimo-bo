import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Slide } from '@optimo/ui-slider';

@Component({
  selector: 'app-package-popup',
  templateUrl: './package-popup.component.html',
  styleUrls: ['./package-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePopupComponent {
  slides: Slide[] = [
    { img: '/assets/images/image-1.png', alt: '' },
    { img: '/assets/images/image-2.png', alt: '' },
    { img: '/assets/images/image-3.png', alt: '' },
  ];
  constructor(private dialogRef: MatDialogRef<PackagePopupComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
