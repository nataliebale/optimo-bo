import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { INotification } from '../../models/INotification';
import * as fromNotification from '../../state';
import { clearNotifications, loadNotificationList, markAllAsSeen, markAsRead } from '../../state/notification.actions';
import { formatRFC3339, addMinutes } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { INotificationListRequest } from '../../models/INotificationListRequest';
import { NotificationViewComponent } from 'libs/ui/notification-view/src';
import { StorageService } from '@optimo/core';
@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
	public notifications: INotification[];
	public unseenNotificationQuantity$: Observable<number>;
	public showList: boolean;
	private _subscribtions: Subscription[] = [];
	private _notificationListRequest: INotificationListRequest = {
		skip: 0,
		take: 99999
	};
	private _interval;
	constructor(private _store: Store, private _dialog: MatDialog,
		private _storage: StorageService) { }

	public ngOnInit(): void {
		this.initialize();
	}

	private intervalLoadList(): void {
		this._interval = setInterval(() => {
			this._store.dispatch(loadNotificationList({
				notificationListRequest: {
					...this._notificationListRequest,
					dateFrom: formatRFC3339(addMinutes(new Date(), -1))
				}
			}))
		}, 60 * 1000)
	}

	private isMobile(): boolean {
		return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	public clickOutside(): void {
		if(!this.isMobile()) {
			this.toggleNotificationList(false);
		}
	}

	public openNotification(notification: INotification): void {
		this.clickOutside();
		this._store.dispatch(markAsRead({ notification: notification }))
		this._dialog.open(NotificationViewComponent,
			{
				data: notification,
				disableClose: true,
				panelClass: ['mat-max-h-680', 'mat-dialog-fullscreen-u-sm', 'mat-w-600', 'mat-w-u-lg-548', 'mat-overflow-hidden']
			}
		);
	}

	public onScroll(): void {
		console.log('onScroll');
	}

	public toggleNotificationList(value?: boolean): void {
		// const oldValue = this.showList;
		const newValue = value === undefined ? !this.showList : value;
		// if (oldValue && !newValue) {
		// 	this.loadNotificationList();
		// }
		this.showList = newValue;

		if (this.showList) {
			this.markAllAsSeen();
		}
	}


	private initialize(): void {
		this.loadNotificationList();
		this.intervalLoadList();
		this.getNotificationList();
		this.getUnseenNotificationQuantity();
	}

	private loadNotificationList(): void {
		this._store.dispatch(loadNotificationList({ notificationListRequest: this._notificationListRequest }))
	}

	private findAndOpenImportantNotification(): void {
		if (this.notifications.length && JSON.parse(localStorage.getItem('showImportantNotification'))) {
			localStorage.setItem('showImportantNotification', 'false')
			const notification: INotification = this.notifications.find(not => not.isImportant);
			if (notification && !notification.read) {
				this.openNotification(notification);
			}
		}
	}

	private getNotificationList(): void {
		const sub$ = this._store.pipe(select(fromNotification.selectNotificationList)).subscribe((notifications: INotification[]) => {
			this.notifications = notifications;
			this.findAndOpenImportantNotification();
		});
		this._subscribtions.push(sub$);
	}

	private getUnseenNotificationQuantity(): void {
		this.unseenNotificationQuantity$ = this._store.pipe(select(fromNotification.unseenNotificationQuantity));
	}

	private markAllAsSeen(): void {
		this._store.dispatch(markAllAsSeen())
	}

	public ngOnDestroy(): void {
		this._subscribtions.forEach(subscribtion => {
			subscribtion.unsubscribe()
		});
		clearInterval(this._interval);
		this._store.dispatch(clearNotifications())
	}

}
