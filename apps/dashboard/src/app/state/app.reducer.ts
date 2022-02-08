import { Action, createReducer, on } from '@ngrx/store';
import * as appActions from './app.actions';

export interface IAppState {
  launchedByViewAs: boolean;
}

export const initialState: IAppState = {
  launchedByViewAs: false,
};

export const appStateKey = 'App';

const appReducer = createReducer(
  initialState,
  on(
    appActions.setLaunchedByViewAs,
    (state): IAppState => ({
      ...state,
      launchedByViewAs: true,
    })
  ),
);

export function reducer(
  state: IAppState | undefined,
  action: Action
): IAppState {
  return appReducer(state, action);
}
