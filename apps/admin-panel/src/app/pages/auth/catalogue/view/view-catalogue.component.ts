import {
  Component,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ClientService } from '@optimo/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { getCatalogueStockitemStatus } from '../../../../core/enums/catalogue-stockitem-status.enum';
import { formatNumber } from '@angular/common';

@Component({
  selector: 'app-view-catalogue',
  templateUrl: './view-catalogue.component.html',
  styleUrls: ['./view-catalogue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCatalogueComponent implements OnInit, OnDestroy {
  stockItem: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  getStockItemStatus = getCatalogueStockitemStatus;
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewCatalogueComponent>,
    @Inject(MAT_DIALOG_DATA) private itemId: string,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(
        filter((r) => r),
        switchMap(() =>
          this.client.delete('catalogstockitems', {
            ids: [this.stockItem.id],
          })
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onEdit(): void {
    this.router.navigate(['/catalogue/edit', this.stockItem.id]).then(() => {
      this.close();
    });
  }

  private getData(): void {
    this.client
      .get(`catalogstockitems/${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((stockItem) => {
        this.stockItem = stockItem;

        this.rows = [
          {
            key: 'სახელი',
            value: this.stockItem.name,
          },
          {
            key: 'ბარკოდი',
            value: this.stockItem.barcode,
          },
          {
            key: 'აღწერა',
            value: this.stockItem.description,
          },
          {
            key: 'სტატუსი',
            value: this.getStockItemStatus(this.stockItem.status),
          },
          // {
          //   key: 'ინდუსტრიები',
          //   value: this.stockItem.businessTypeNames,
          // },
          {
            key: 'კატეგორია',
            value: this.stockItem.category,
          },
          {
            key: 'მომწოდებელი',
            value: this.stockItem.distributor,
          },
          {
            key: 'თვითღირებულება',
            value: `${formatNumber(this.stockItem.unitCost, 'en', '1.4-4')} ₾`,
          },
          {
            key: 'გასაყიდი ფასი',
            value: `${formatNumber(this.stockItem.unitPrice, 'en', '1.4-4')} ₾`,
          },
        ];

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
