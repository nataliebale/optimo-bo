import { createSelector } from '@ngrx/store';
import { IAppState, appStateKey } from './app.reducer';


export enum EAppActionType {
	setLaunchedByViewAs = '[App] Set Launched By View As'
}

export const selectAppState = (state: object) => state[appStateKey];

export const getLaunchedByViewAs = createSelector(
	selectAppState,
	(state: IAppState) => state.launchedByViewAs
);

