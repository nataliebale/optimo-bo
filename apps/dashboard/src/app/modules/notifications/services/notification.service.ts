import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClientService, StorageService } from '@optimo/core';
import { Observable, of } from 'rxjs';
import { INotification } from '../models/INotification';
import { INotificationListRequest } from '../models/INotificationListRequest';
import { INotificationListResponse } from '../models/INotificationListResponse';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	constructor(
		private _client: ClientService,
		private _storage: StorageService,
	) { }


	public markAllAsSeen(): Observable<void> {
		if (this._storage.isAdmin) return of(null);
		return this._client
			.post(`notifications/seenall`)
	}

	public markAsRead(notification: INotification): Observable<void> {
		if (this._storage.isAdmin) return of(null);
		return this._client
			.post(`notifications/read/${notification.id}`)
	}

	public getNotificationList(notificationListRequest: INotificationListRequest): Observable<INotificationListResponse> {
		if (this._storage.isAdmin)
			return of({
				list: [],
				unseen: 0,
				total: 0,
			});
		console.log(notificationListRequest);
		let httpParams = new HttpParams();
		Object.keys(notificationListRequest).forEach(function (key) {
			httpParams = httpParams.append(key, notificationListRequest[key]);
		});
		return this._client
			.get(`notifications`, {
				params: httpParams
			})
		// const notifications: INotification[] = [
		// 	{
		// 		id: 1,
		// 		name: 'name 1',
		// 		description: "description 1",
		// 		isImportant: true,
		// 		sendDate: new Date(),
		// 		seen: false,
		// 		read: false
		// 	},
		// 	{
		// 		id: 2,
		// 		name: 'name 2',
		// 		description: "description 2",
		// 		isImportant: false,
		// 		sendDate: new Date(),
		// 		seen: false,
		// 		read: false
		// 	},
		// 	{
		// 		id: 3,
		// 		name: 'name 3',
		// 		description: "description 3",
		// 		isImportant: true,
		// 		sendDate: new Date(),
		// 		seen: false,
		// 		read: false
		// 	},
		// 	{
		// 		id: 4,
		// 		name: 'name 4',
		// 		description: "description 4",
		// 		isImportant: false,
		// 		sendDate: new Date(),
		// 		seen: false,
		// 		read: false
		// 	}
		// ]
		// const response: INotificationListResponse = {
		// 	list: notifications,
		// 	total: 34,
		// 	unseen: 30
		// }
		// return of(response)
	}
}
