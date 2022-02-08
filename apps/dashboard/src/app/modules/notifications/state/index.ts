import { createSelector } from '@ngrx/store';
import { INotificationFeatureState, notificationFeatureKey } from './notification.reducer';

export const selectNotificationFeatureState = (state: object) => state[notificationFeatureKey];

export const selectNotificationList = createSelector(
	selectNotificationFeatureState,
	(state: INotificationFeatureState) => Object.values(state.notificationList).reverse()
);

export const unseenNotificationQuantity = createSelector(
	selectNotificationFeatureState,
	(state: INotificationFeatureState) => state.unseen
);

export const totalNotificationQuantity = createSelector(
	selectNotificationFeatureState,
	(state: INotificationFeatureState) => state.total
);

export const selectNotificationListError = createSelector(
	selectNotificationFeatureState,
	(state: INotificationFeatureState) => state.notificationListError
);