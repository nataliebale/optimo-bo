import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthorizedLayoutComponent } from './authorized-layout.component';
import { HeadbarComponent } from './headbar/headbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { UserIdleModule } from 'angular-user-idle';
import { IconModule } from '@optimo/ui-icon';
import { HeadbarMenuComponent } from './headbar/menu/headbar-menu.component';
import { HeadbarLocationComponent } from './headbar/location/headbar-location.component';
import { NestedMenuModule } from '@optimo/ui-nested-menu';
import { MessagePopupModule } from '../../popups/message-popup/message-popup.module';
import { IdlePopupModule } from '../../popups/idle-popup/idle-popup.module';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationModule } from '../../modules/notifications/notification.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NestedMenuModule,
    UserIdleModule.forRoot({ idle: 1800, timeout: 60, ping: 1 }),
    MatDialogModule,
    MatBottomSheetModule,
    IdlePopupModule,
    MessagePopupModule,
    ClickOutsideModule,
    IconModule,
    TranslateModule.forChild(),
	NotificationModule
  ],
  declarations: [
    AuthorizedLayoutComponent,
    HeadbarComponent,
    HeadbarMenuComponent,
    HeadbarLocationComponent,
    SidebarComponent,
  ],
  exports: [AuthorizedLayoutComponent],
})
export class AuthorizedLayoutModule {}
