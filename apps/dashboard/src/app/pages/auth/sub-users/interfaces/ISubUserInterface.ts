export interface ISubUser {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    permission: [{
        locationId: number
    }],
    lastLoginDate: string
  }
  