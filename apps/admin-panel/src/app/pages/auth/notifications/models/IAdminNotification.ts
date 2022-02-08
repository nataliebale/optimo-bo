import { ENotificationItemStatus } from "./ENotificationItemStatus";

export interface IAdminNotification {
	businessTypes: string;
	createDate: Date;
	description: string;
	id: number;
	isImportant: boolean;
	name: string;
	userName: string;
	status: ENotificationItemStatus
}


