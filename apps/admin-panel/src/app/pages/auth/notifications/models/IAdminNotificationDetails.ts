

export interface IAdminNotificationDetails {
	id: number;
	name: string;
	description: string;
	isImportant: boolean;
	isForTesting: boolean;
	allBusinessTypes: boolean;
	businessTypes: number[];
}
