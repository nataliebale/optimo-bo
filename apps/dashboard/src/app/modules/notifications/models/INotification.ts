export interface INotification {
	id: number;
	name: string;
	description: string;
	isImportant: boolean;
	sendDate: Date;
	seen: boolean;
	read: boolean;
}
