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
import { getRequestStatus } from '../../../../core/enums/request-status.enum';
import { getCompanyType } from 'apps/admin-panel/src/app/core/enums/ECompanyType';
import { getPackageType } from 'apps/admin-panel/src/app/core/enums/EPackageType';

@Component({
  selector: 'app-view-registration-request',
  templateUrl: './view-registration-request.component.html',
  styleUrls: ['./view-registration-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewRegistrationRequestComponent implements OnInit, OnDestroy {
  registrationRequest: any;
  rows: Array<{ key: string; value: string }>;

  private unsubscribe$ = new Subject<void>();
  getRegistrationRequestStatus = getRequestStatus;
  getCompanyType = getCompanyType;
  getPackageType = getPackageType;
  constructor(
    private client: ClientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ViewRegistrationRequestComponent>,
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
        width: '400px',
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(
        filter((r) => r),
        switchMap(() =>
          this.client.delete('registrationrequests', {
            ids: [this.registrationRequest.id],
          })
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  private getData(): void {
    this.client
      .get(`registrationrequests/single?id=${this.itemId}`)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((item) => {
        this.registrationRequest = item;

        this.rows = [
          {
            key: 'სახელი',
            value: `${this.registrationRequest.firstName} ${this.registrationRequest.lastName}`,
          },
          {
            key: 'კომპანიის დასახელება',
            value: this.registrationRequest.companyName,
          },
          {
            key: 'საიდენტიფიკაციო ნომერი',
            value: this.registrationRequest.identificationNumber,
          },
          {
            key: 'კომპანიის ტიპი',
            value: this.getCompanyType(this.registrationRequest.companyType),
          },
          {
            key: 'ბიზნეს ტიპი',
            value: this.registrationRequest.businessTypes[0]
              ? this.registrationRequest.businessTypes[0].name
              : '',
          },
          {
            key: 'ტელეფონი',
            value: this.registrationRequest.phoneNumber,
          },
          {
            key: 'ელ. ფოსტა',
            value: this.registrationRequest.email,
          },
          {
            key: 'Has Soft',
            value: this.registrationRequest.isUsingManagementSoftware,
          },
          {
            key: 'სოლუშენის აღწერა',
            value: this.registrationRequest
              .currentManagementSolutionDescription,
          },
          {
            key: 'პაკეტი',
            value: this.getPackageType(this.registrationRequest.packageType),
          },
          {
            key: 'სტატუსი',
            value: this.getRegistrationRequestStatus(
              this.registrationRequest.registrationRequestStatus
            ),
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
