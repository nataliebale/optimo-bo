import { INotification } from "./INotification";



export interface INotificationListResponse {
	list: INotification[];
	unseen: number;
	total: number;
}

