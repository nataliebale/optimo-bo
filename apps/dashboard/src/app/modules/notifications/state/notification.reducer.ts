import { Action, createReducer, on } from "@ngrx/store";
import { INotification } from "../models/INotification";
import * as notificationActions from './notification.actions';

export interface INotificationFeatureState {
	notificationList: { [key: number]: INotification; },
	unseen: number;
	total: number;
	notificationListError: string;
}

export const initialState: INotificationFeatureState = {
	notificationList: [],
	unseen: 0,
	total: 0,
	notificationListError: ''
};

export const notificationFeatureKey = 'notificationFeature';


const notificationReducer = createReducer(
	initialState,
	on(
		notificationActions.loadSuccessNotificationList,
		(state, { notificationListResponse }): INotificationFeatureState => ({
			...state,
			notificationList: getNotifications(state.notificationList, notificationListResponse.list),
			unseen: notificationListResponse.unseen,
			total: notificationListResponse.total,
		})
	),
	on(
		notificationActions.loadFailNotificationList,
		(state, { error }): INotificationFeatureState => ({ ...state, notificationListError: error })
	),
	on(
		notificationActions.markAllAsSeen,
		(state): INotificationFeatureState => ({
			...markAllAsSeen(state)
		})
	),
	on(
		notificationActions.clearNotifications,
		(): INotificationFeatureState => ({
			...initialState
		})
	),
	on(
		notificationActions.markAsRead,
		(state, { notification }): INotificationFeatureState => ({
			...markAsRead(state, notification)
		}
		)
	)
);

export function reducer(state: INotificationFeatureState | undefined, action: Action): INotificationFeatureState {
	return notificationReducer(state, action);
}

export function getMapFromArray(data: INotification[]): { [key: number]: INotification; } {
	let result: { [key: number]: INotification; } = {};
	data.forEach(notification => {
		result[notification.id] = notification;
	});
	return result
}

export function getNotifications(NotificationList: { [key: number]: INotification; }, newNotificationList: INotification[]): { [key: number]: INotification; } {
	let oldNotifications: { [key: number]: INotification; } = JSON.parse(JSON.stringify(NotificationList));
	let newNotifications: { [key: number]: INotification; } = getMapFromArray(newNotificationList);
	return {
		...oldNotifications,
		...newNotifications,
	};
}

export function markAllAsSeen(state: INotificationFeatureState): INotificationFeatureState {
	let tempState: INotificationFeatureState = JSON.parse(JSON.stringify(state));
	tempState.unseen = 0;
	for (let key in tempState.notificationList) {
		let notification = tempState.notificationList[key];
		notification.seen = true;
	}
	console.log(tempState);
	return { ...tempState };
}

export function markAsRead(state: INotificationFeatureState, notification: INotification): INotificationFeatureState {
	let tempState: INotificationFeatureState = JSON.parse(JSON.stringify(state));
	tempState.notificationList[notification.id].read = true;
	return { ...tempState }
}
