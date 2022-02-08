import { createAction, props } from "@ngrx/store";
import { ENotificationsActionType } from "../models/ENotificationsActionType";
import { INotification } from "../models/INotification";
import { INotificationListRequest } from "../models/INotificationListRequest";
import { INotificationListResponse } from "../models/INotificationListResponse";

export const loadNotificationList = createAction(
	ENotificationsActionType.loadNotificationList,
	props<{ notificationListRequest: INotificationListRequest }>()
);

export const loadSuccessNotificationList = createAction(
	ENotificationsActionType.loadSuccessNotificationList,
	props<{ notificationListResponse: INotificationListResponse }>()
);

export const loadFailNotificationList = createAction(
	ENotificationsActionType.loadFailNotificationList,
	props<{ error: string }>()
);

export const markAsRead = createAction(
	ENotificationsActionType.markAsRead,
	props<{ notification: INotification }>()
);

export const markAllAsSeen = createAction(
	ENotificationsActionType.markAllAsSeen
);

export const noopAction = createAction(
	ENotificationsActionType.noopAction
);

export const clearNotifications = createAction(
	ENotificationsActionType.clearNotifications
);