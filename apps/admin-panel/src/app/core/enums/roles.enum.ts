export const ROLES = [
  { value: 0, label: 'Admin' },
  // { value: 1, label: 'BO' },
  // { value: 2, label: 'Device' },
];

export enum Roles {
  Admin = 0,
  BO,
  Device,
}

export const rolesData = {
  [Roles.Admin]: 'Admin',
  [Roles.BO]: 'BO',
  [Roles.Device]: 'Device',
};

export function getRoles(role: number): string {
  switch (role) {
    case Roles.Admin: {
      return 'Admin';
    }
    case Roles.BO: {
      return 'BO';
    }
    case Roles.Device: {
      return 'Device';
    }
    default:
      return '';
  }
}
