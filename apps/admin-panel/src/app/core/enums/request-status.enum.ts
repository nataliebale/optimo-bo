export const REQUEST_STATUS = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Suspended' },
  { value: 99, label: 'Deleted' },
];

export enum RequestStatus {
  Active = 0,
  Suspended = 1,
  Deleted = 99,
}

export const requestStatusData = {
  [RequestStatus.Active]: 'Active',
  [RequestStatus.Suspended]: 'Suspended',
  [RequestStatus.Deleted]: 'Deleted',
};

export function getRequestStatus(status: number): string {
  switch (status) {
    case RequestStatus.Active: {
      return 'Active';
    }
    case RequestStatus.Suspended: {
      return 'Suspended';
    }
    case RequestStatus.Deleted: {
      return 'Deleted';
    }
    default:
      return '';
  }
}
