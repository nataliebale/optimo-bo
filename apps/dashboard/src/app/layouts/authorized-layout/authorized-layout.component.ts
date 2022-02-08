import { IMixpanelUser } from './../../../../../../libs/mixpanel/src/lib/models/IMixpanelUser';
import { MixpanelService } from './../../../../../../libs/mixpanel/src/lib/services/mixpanel.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import {
  IdleActions,
  IdlePopupComponent,
} from 'apps/dashboard/src/app/popups/idle-popup/idle-popup.component';
import {
  StorageService,
  Service,
  RoutingStateService,
  EOptimoProductType,
} from '@optimo/core';
import { Router } from '@angular/router';
import { MessagePopupComponent } from 'apps/dashboard/src/app/popups/message-popup/message-popup.component';
import { ClientService, filterNavsByProductType } from '@optimo/core';
import { UserDetails } from 'apps/dashboard/src/app/pages/auth/profile/personal-information/profile-personal-information.component';
import { MENU_TREE } from './sidebar/nested-menu.mock';
import { LocationService } from '../../core/services/location/location.service';
import decode from 'jwt-decode';
// import { IMixpanelUser, MixpanelService } from '@optimo/mixpanel';
import { PackageType } from 'libs/core/src/lib/models/package-type.enum';
import { environment } from 'apps/dashboard/src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Providers } from 'apps/dashboard/src/app/core/enums/providers.enum';
@Component({
  selector: 'app-authorized-layout',
  templateUrl: './authorized-layout.component.html',
  styleUrls: ['./authorized-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorizedLayoutComponent implements OnInit, OnDestroy {
  pageLoading: boolean;
  userDetails: UserDetails;
  glovoIntegration: any;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private userIdle: UserIdleService,
    private storage: StorageService,
    private dialog: MatDialog,
    private bottomSeet: MatBottomSheet,
    private router: Router,
    private client: ClientService,
    private _translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private routingState: RoutingStateService,
    private location: LocationService,
    private _mixpanelService: MixpanelService
  ) {
    this.routingState.updatePageTitle(
      filterNavsByProductType(
        MENU_TREE,
        this.storage.currentProductType
      ).map((menuItem) => this.translateMenuItem(menuItem))
    );
  }

  private translateMenuItem(menuItem): any {
    const translatedItem = {
      ...menuItem,
      text: this._translate.instant(menuItem.text),
      pageName: this._translate.instant(menuItem.text || menuItem.pageName),
    };
    if (translatedItem.children) {
      translatedItem.children = translatedItem.children.map((childMenuItem) =>
        this.translateMenuItem(childMenuItem)
      );
    }
    return translatedItem;
  }

  ngOnInit(): void {
    this.userIdle.startWatching();

    this.userIdle
      .onTimerStart()
      .pipe(
        filter((time) => time === 1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => this.openIdlePopup());

    this.getUserDetails();
    this.mixpanelIdentify();
  }

  private mixpanelIdentify(): void {
    const accessToken = decode(this.storage.getAccessToken());
    const userIdentifier: string = accessToken.uid;
    const user: IMixpanelUser = {
      legalEntityName: accessToken.LegalEntityName,
      packageType: PackageType[+accessToken.PackageType],
      productType: EOptimoProductType[+accessToken.ProductType],
      fullName: accessToken.fullName,
      isForTesting: accessToken.isForTesting,
    };
    this._mixpanelService.identify(user, userIdentifier);
  }

  private getUserDetails(): void {
    this.client
      .get('user/getuserdetails', { service: Service.Auth })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((userDetails: UserDetails) => {
        this.userDetails = userDetails;
        // console.log(33333333333,userDetails);
        if(userDetails && userDetails.integrationData){
          userDetails.integrationData.map((item) => {
            if (item && item.provider && item.provider === Providers.Glovo) {
              this.glovoIntegration = item;
              this.cdr.markForCheck();
            }
          });
        }
        this.cdr.markForCheck();
      });
  }

  private openIdlePopup(): void {
    this.dialog
      .open(IdlePopupComponent, {
        width: '548px',
        disableClose: true,
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((acton: IdleActions) => {
        switch (acton) {
          case IdleActions.Continue:
            this.userIdle.resetTimer();
            break;
          case IdleActions.Logout:
            this.onLogout();
            break;
          case IdleActions.Timeout:
            this.onLogout(false);
            this.openLoggedOutMessagePopup();
            break;
        }
      });
  }

  private openLoggedOutMessagePopup(): void {
    this.dialog
      .open(MessagePopupComponent, {
        width: '548px',
        disableClose: true,
        // data: {
        //   title: 'თქვენ გამოხვედით სისტემიდან',
        //   message: 'უმოქმედობის გამო თქვენ გამოხვედით სისტემიდან',
        //   btnLabel: 'შესვლა',
        // },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.router.navigate(['/login']);
      });
  }

  onLogout(navigateToLogin: boolean = true): void {
    this.dialog.closeAll();
    this.bottomSeet.dismiss();
    this.client.get('user/SignOut', { service: Service.Auth }).subscribe();
    this.storage.deleteAccessToken();
    this.storage.resetSpace();
    this.location.unsetLocation();
    this._mixpanelService.reset();
    if (navigateToLogin) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.userIdle.stopWatching();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
