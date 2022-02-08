import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NotificationEffects } from './state/notification.effects';
import * as fromNotification from './state/notification.reducer';
import { NotificationsComponent } from './containers/notifications/notifications.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { CommonModule } from '@angular/common';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { IconModule } from '@optimo/ui-icon';
import { UiNotificationViewModule } from 'libs/ui/notification-view/src';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [NotificationsComponent, NotificationListComponent],
  imports: [
	InfiniteScrollModule,
	CommonModule,
	ClickOutsideModule,
    StoreModule.forFeature(fromNotification.notificationFeatureKey, fromNotification.reducer),
    EffectsModule.forFeature([NotificationEffects]),
	IconModule,
    UiNotificationViewModule,
	MatTooltipModule,
    TranslateModule.forChild(),
  ],
  exports: [NotificationsComponent],
})
export class NotificationModule {}
