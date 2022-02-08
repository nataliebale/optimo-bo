export const USER_STATUS = [
  { value: false, label: 'Unlocked' },
  { value: true, label: 'Locked' },
];

// export enum UserStatus {
//   Unlocked = false,
//   Locked = true,
// }

export const userStatusData = {
  true: 'Locked',
  false: 'Unlocked',
};

// export function getUserStatus(status: number): string {
//   switch (status) {
//     case UserStatus.Locked: {
//       return 'Locked';
//     }
//     case UserStatus.Unlocked: {
//       return 'Unlocked';
//     }
//     default:
//       return '';
//   }
// }

export const USER_TYPE = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Registered' },
  { value: 2, label: 'Deleted' },
  { value: 3, label: 'PasswordResetPending' },
];

export enum UserType {
  Pending = 0,
  Registered = 1,
  Deleted = 2,
  PasswordResetPending = 3,
}

export const userTypeData = {
  [UserType.Pending]: 'Pending',
  [UserType.Registered]: 'Registered',
  [UserType.Deleted]: 'Deleted',
  [UserType.PasswordResetPending]: 'PasswordResetPending',
};

export function getUserType(type: number): string {
  switch (type) {
    case UserType.Pending: {
      return 'Pending';
    }
    case UserType.Registered: {
      return 'Registered';
    }
    case UserType.Deleted: {
      return 'Deleted';
    }
    case UserType.PasswordResetPending: {
      return 'PasswordResetPending';
    }
    default:
      return '';
  }
}
