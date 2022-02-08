import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { BottomSheetDispacherModule } from '@optimo/ui-bottom-sheet-dispacher';
import { DynamicSelectModule } from '@optimo/ui-dynamic-select';
import { IconModule } from '@optimo/ui-icon';
import { QuillModule } from 'ngx-quill';
import { NotificationDetailsComponent } from './notification-details.component';
import { UiNotificationViewModule } from 'libs/ui/notification-view/src';

@NgModule({
	declarations: [NotificationDetailsComponent],
	imports: [
		CommonModule,
		BottomSheetDispacherModule.forRoot(NotificationDetailsComponent),
		FormsModule,
		ReactiveFormsModule,
		IconModule,
		QuillModule.forRoot(),
		NgSelectModule,
		DynamicSelectModule,
		UiNotificationViewModule,
		TranslateModule.forChild()
	],
})
export class NotificationDetailsModule { }
