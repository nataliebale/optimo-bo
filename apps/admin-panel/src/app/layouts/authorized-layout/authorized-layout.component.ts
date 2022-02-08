import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ClientService, Service, StorageService } from '@optimo/core';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-authorized-layout',
  templateUrl: './authorized-layout.component.html',
  styleUrls: ['./authorized-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorizedLayoutComponent implements OnInit, OnDestroy {
  pageLoading: boolean;
  userDetails: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    // private userIdle: UserIdleService,
    private storage: StorageService,
    private dialog: MatDialog,
    private bottomSeet: MatBottomSheet,
    private router: Router,
    private client: ClientService
  ) // private cdr: ChangeDetectorRef
  {}

  ngOnInit(): void {
    // this.userIdle.startWatching();
    // this.userIdle
    //   .onTimerStart()
    //   .pipe(
    //     filter((time) => time === 1),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe(this.openIdlePopup.bind(this));
    // this.getUserDetails();
  }

  private getUserDetails(): void {
    // this.client
    //   .get('user/getuserdetails', { service: Service.Auth })
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((userDetails: UserDetails) => {
    //     this.userDetails = userDetails;
    //     this.cdr.markForCheck();
    //   });
  }

  private openIdlePopup(): void {
    // this.dialog
    //   .open(IdlePopupComponent, {
    //     width: '520px',
    //     disableClose: true,
    //   })
    //   .afterClosed()
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe((acton: IdleActions) => {
    //     switch (acton) {
    //       case IdleActions.Continue:
    //         this.userIdle.resetTimer();
    //         break;
    //       case IdleActions.Logout:
    //         this.onLogout();
    //         break;
    //       case IdleActions.Timeout:
    //         this.onLogout(false);
    //         this.openLoggedOutMessagePopup();
    //         break;
    //     }
    //   });
  }

  private openLoggedOutMessagePopup(): void {
    // this.dialog
    //   .open(MessagePopupComponent, {
    //     width: '520px',
    //     disableClose: true,
    //     data: {
    //       message: 'უმოქმედობის გამო თქვენ გახვედით სისტემიდან',
    //       btnLabel: 'სისტემაში შესვლა',
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(takeUntil(this.unsubscribe$))
    //   .subscribe(() => {
    //     this.router.navigate(['/login']);
    //   });
  }

  onLogout(navigateToLogin: boolean = true): void {
    this.dialog.closeAll();
    this.bottomSeet.dismiss();
    this.client.get('user/SignOut', { service: Service.Auth }).subscribe();
    this.storage.deleteAccessToken();
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    // this.userIdle.stopWatching();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
