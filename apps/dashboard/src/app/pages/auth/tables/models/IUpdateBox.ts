import { EBoxType } from './EBoxType';


export interface IUpdateBox {
	width: number;
	height: number;
	left: number;
	top: number;
	name: string;
	boxType: EBoxType;
}
