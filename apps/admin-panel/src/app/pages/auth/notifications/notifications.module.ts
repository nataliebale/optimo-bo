import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableModule } from '@optimo/ui-table';
import { IconModule } from '@optimo/ui-icon';
import { NotificationsComponent } from './notifications.component';
import { UiNotificationViewModule } from 'libs/ui/notification-view/src';

const routes: Routes = [
	{
	  path: '',
	  component: NotificationsComponent,
	},
	{
	  path: 'add',
	  loadChildren: () =>
		import('./detail/notification-details.module').then((m) => m.NotificationDetailsModule),
	},
	{
	  path: 'edit/:id',
	  loadChildren: () =>
		import('./detail/notification-details.module').then((m) => m.NotificationDetailsModule),
	},
  ];

@NgModule({
  declarations: [NotificationsComponent],
  imports: [
	CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatTooltipModule,
    IconModule,
  ]
})
export class NotificationsModule { }

