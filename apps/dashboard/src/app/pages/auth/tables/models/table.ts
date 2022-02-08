import { IArrangement } from './IArrangement';
export interface ITable {
	id: number;
	name: string;
	arrangement: IArrangement;
	tableEditMode?: boolean;
	editableTableName?: string;
	hasActiveShifts?: string;
}



