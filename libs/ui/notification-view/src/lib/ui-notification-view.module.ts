import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { IconModule } from '@optimo/ui-icon';
import { NotificationViewComponent } from './components/notification-view/notification-view.component';
import { SafeHtmlPipe } from './safe-html-pipe';

@NgModule({
	declarations: [NotificationViewComponent, SafeHtmlPipe],
	imports: [CommonModule, MatDialogModule, IconModule],
	exports: [NotificationViewComponent]
})
export class UiNotificationViewModule { } 