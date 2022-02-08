import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ENotificationsActionType } from '../models/ENotificationsActionType';
import { INotificationListResponse } from '../models/INotificationListResponse';
import { NotificationService } from '../services/notification.service';
import { loadFailNotificationList, loadNotificationList, loadSuccessNotificationList, noopAction } from './notification.actions';

@Injectable()
export class NotificationEffects {
	constructor(private _actions$: Actions, private _notificationService: NotificationService) { }

	public loadNotificationList$: Observable<Action> = createEffect(() =>
		this._actions$.pipe(
			ofType(ENotificationsActionType.loadNotificationList),
			mergeMap(({ notificationListRequest }) => this._notificationService.getNotificationList(notificationListRequest)
				.pipe(
					map((notificationListResponse: INotificationListResponse) => (
						loadSuccessNotificationList({ notificationListResponse: notificationListResponse })
					)),
					catchError(() => of(
						loadFailNotificationList({ error: 'some error message' })
					))
				)
			)
		)
	);

	public markAllAsSeen$: Observable<Action> = createEffect(() =>
		this._actions$.pipe(
			ofType(ENotificationsActionType.markAllAsSeen),
			mergeMap(() => this._notificationService.markAllAsSeen()
				.pipe(
					map(() => (
						loadNotificationList({
							notificationListRequest: {
								skip: 0,
								take: 99999
							}
						})
					))
				)
			)
		)
	);

	public markAsRead$: Observable<Action> = createEffect(() =>
		this._actions$.pipe(
			ofType(ENotificationsActionType.markAsRead),
			mergeMap(({ notification }) => this._notificationService.markAsRead(notification)
				.pipe(
					map(() => (
						loadNotificationList({
							notificationListRequest: {
								skip: 0,
								take: 99999
							}
						})
					))
				)
			)
		)
	);
}