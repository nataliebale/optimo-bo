import { createAction } from '@ngrx/store';
import { EAppActionType } from '.';

export const setLaunchedByViewAs = createAction(
  EAppActionType.setLaunchedByViewAs
);
