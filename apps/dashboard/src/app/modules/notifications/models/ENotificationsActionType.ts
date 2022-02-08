export enum ENotificationsActionType {
	loadNotificationList = '[Notifications] Load Notification List',
	loadSuccessNotificationList = '[Notifications] Load Success Notification List',
	loadFailNotificationList = '[Notifications] Load Fail Notification List',
	markAllAsSeen = '[Notifications] Mark All Notification As Seen',
	markAsRead = '[Notifications] Mark As Read',
	noopAction = '[Notifications] Noop Action',
	clearNotifications = '[Notifications] Clear Notifications',
}
