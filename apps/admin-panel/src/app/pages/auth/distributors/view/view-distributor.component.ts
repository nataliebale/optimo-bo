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
// tslint:disable-next-line:nx-enforce-module-boundaries
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';

@Component({
  selector: 'app-view-distributor',
  templateUrl: './view-distributor.component.html',
  styleUrls: ['./view-distributor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDistributorComponent implements OnInit, OnDestroy {
  distributor: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewDistributorComponent>,
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
          this.client.delete('supplier', {
            ids: [this.distributor.id],
          })
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  onEdit(): void {
    this.router
      .navigate(['/suppliers/edit', this.distributor.id])
      .then(() => {
        this.close();
      });
  }

  private getData(): void {
    this.client
      .get(`supplier/single?id=${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((distributor) => {
        this.distributor = distributor;

        this.rows = [
          {
            key: 'დასახელება',
            value: this.distributor.name,
          },
          {
            key: 'საიდენტიფიკაციო კოდი',
            value: this.distributor.inn,
          },
          {
            key: 'ნომერი',
            value: this.distributor.phoneNumber,
          },
          {
            key: 'ელ. ფოსტა',
            value: this.distributor.email,
          },
          {
            key: 'საკონტაქტო პირი',
            value: this.distributor.contactName,
          },
          {
            key: 'ანგარიშის ნომერი',
            value: this.distributor.bankAccountNumber,
          },
          {
            key: 'დღგ-ს გადამხდელი',
            value: this.distributor?.isVATRegistered ? 'კი' : 'არა',
          },
          // {
          //   key: 'ინდუსტრიები',
          //   value: this.distributor.businessTypesPlain,
          // },
        ];

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
