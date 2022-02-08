import { ITable } from './table';

export interface ISpace {
    id: number;
    name: string;
    hasActiveShifts: boolean;
    tables: ITable[];
}


