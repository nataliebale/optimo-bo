import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ClientService } from '@optimo/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { StorageService } from '@optimo/core';
import { LoadingPopupComponent } from '../../../../popups/loading-popup/loading-popup.component';


@Component({
  selector: 'app-catalogue-images-sync-popup',
  templateUrl: './catalogue-images-sync-popup.component.html',
  styleUrls: ['./catalogue-images-sync-popup.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueImagesSyncPopupComponent implements OnInit, OnDestroy {
  locations: any[];
  selectedLocationId: number;
  syncSuccess: boolean;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private dialogRef: MatDialogRef<CatalogueImagesSyncPopupComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  onApprove(): void {
    this.syncSuccess = undefined;
    const request = this.client.post('catalogstockitems/sync/images');
    this.dialog
      .open(LoadingPopupComponent, {
        width: '548px',
        data: {
          observable: request,
          message: 'მიმდინარეობს სურათების სინქრონიზაცია',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        if (response) {
          this.syncSuccess = true;
          this.cdr.markForCheck();
        } else {
          this.syncSuccess = false;
          this.cdr.markForCheck();
        }
      });
  }

  onDecline(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
