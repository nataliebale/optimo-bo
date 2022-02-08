import { ECommandValidationErrorCode } from '../../enums/ECommandValidationErrorCode';

export const DOMAIN_EXCEPTIONS = {
  [ECommandValidationErrorCode.ShiftIsNotClosed]: 'ShiftIsNotClosed',
  [ECommandValidationErrorCode.DuplicatedCategoryName]: 'DuplicateCategoryName',
  [ECommandValidationErrorCode.SpaceNotFound]: 'SpaceNotFound',
};
