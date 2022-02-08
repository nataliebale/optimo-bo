import { ISpace } from './space';
import { ESpaceAction } from './space-action';

export interface ISpaceDetailsResponce {
  success: boolean;
  space: ISpace;
  spaceAction: ESpaceAction;
}
