import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EBoxType } from '../models/EBoxType';
import { IArrangement } from '../models/IArrangement';
import { IBoxBorders } from '../models/IBoxBorders';
import { IUpdateBox } from '../models/IUpdateBox';

export enum EStatus {
	OFF = 'Off',
	RESIZE = 'Resize',
	MOVE = 'Move'
}

@Component({
	selector: 'app-resizable-draggable',
	templateUrl: './resizable-draggable.component.html',
	styleUrls: ['./resizable-draggable.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableDraggableComponent implements OnInit, AfterViewInit {
	@Input() arrangement: IArrangement;
	@Input('name') public name: string;
	@Input('busyTableNames') public busyTableNames: string[];
	@Input('unitSize') public unitSize: number;
	@Input('containerWidth') public containerWidth: number;
	@Input('containerHeight') public containerHeight: number;
	@ViewChild("box") public box: ElementRef;
	@Output() updateBox = new EventEmitter<IUpdateBox>();
	@Output() deleteBox = new EventEmitter();
	@Output() sayTableError = new EventEmitter();
	@Output() onBoxTouch = new EventEmitter<boolean>();
	@Output() showSaveHint = new EventEmitter<boolean>();
	public Status = EStatus;
	public EBoxType = EBoxType;
	public editMode: boolean;
	public editableName: string;
	private boxPosition: { left: number, top: number };
	public mouse: { x: number, y: number }
	public status: EStatus = EStatus.OFF;
	public tableNameErrorMode: boolean;
	private mouseClick: { x: number, y: number, left: number, top: number }
	private arrangementUpdated: boolean;
	private boxBorders: IBoxBorders;
	private oldArrangement: IArrangement
	ngOnInit() { }

	ngAfterViewInit() {
		this.loadBox();
	}

	private getBoxBorders() {
		this.boxBorders = {
			minWidth: 2 * this.unitSize,
			maxWidth: this.containerWidth - this.arrangement?.left,
			minHeight: 2 * this.unitSize,
			maxHeight: this.containerHeight - this.arrangement?.top,
			minLeft: 0,
			maxLeft: this.containerWidth - this.arrangement?.width,
			minTop: 0,
			maxTop: this.containerHeight - this.arrangement?.height,
		}
	}

	private getOldArrangement() {
		this.oldArrangement = { ...this.arrangement }
	}

	private checkArrangementUpdate() {
		this.arrangementUpdated = JSON.stringify(this.oldArrangement) !== JSON.stringify(this.arrangement)
	}

	private loadBox() {
		const { left, top } = this.box.nativeElement.getBoundingClientRect();
		this.boxPosition = { left, top };
		this.getBoxBorders();
		this.getOldArrangement();
	}

	moveHandler(event: MouseEvent) {
		this.mouseClick = { x: event.clientX, y: event.clientY, left: this.arrangement?.left, top: this.arrangement?.top };
		this.status = EStatus.MOVE;
	}

	resizeHandler(event: MouseEvent) {
		event.stopPropagation();
		this.status = EStatus.RESIZE;
	}

	mouseUpHandler(event: MouseEvent) {
		event.stopPropagation();
		if (this.arrangementUpdated) {
			this.loadBox();
			this.updateBoxHandler();
			this.arrangementUpdated = false;
		}
		this.status = EStatus.OFF;
	}

	@HostListener('window:mousemove', ['$event'])
	onMouseMove(event: MouseEvent) {
		if (this.editMode) {
			return;
		}
		this.mouse = { x: event.clientX, y: event.clientY };

		if (this.status === EStatus.RESIZE) {
			this.resize();
		} else if (this.status === EStatus.MOVE) {
			this.move();
		}
	}

	private resize() {
		let width = this.mouse.x - this.boxPosition.left;
		let height = this.mouse.y - this.boxPosition.top;
		if (width > this.boxBorders.maxWidth) {
			width = this.boxBorders.maxWidth;
		} else if (width < this.boxBorders.minWidth) {
			width = this.boxBorders.minWidth
		}

		if (height > this.boxBorders.maxHeight) {
			height = this.boxBorders.maxHeight;
		} else if (height < this.boxBorders.minHeight) {
			height = this.boxBorders.minHeight
		}
		this.calculateSizeByUnit(width, height);
		this.checkArrangementUpdate();

	}

	private calculateSizeByUnit(width: number, height: number) {
		this.arrangement.width = this.unitSize * Math.round(width / this.unitSize);
		this.arrangement.height = this.unitSize * Math.round(height / this.unitSize);
	}

	private calculatePositionByUnit(left: number, top: number) {
		this.arrangement.left = this.unitSize * Math.round(left / this.unitSize);
		this.arrangement.top = this.unitSize * Math.round(top / this.unitSize);
	}

	private move() {
		let left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
		let top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
		if (left > this.boxBorders.maxLeft) {
			left = this.boxBorders.maxLeft;
		} else if (left < this.boxBorders.minLeft) {
			left = this.boxBorders.minLeft
		}

		if (top > this.boxBorders.maxTop) {
			top = this.boxBorders.maxTop;
		} else if (top < this.boxBorders.minTop) {
			top = this.boxBorders.minTop
		}

		this.calculatePositionByUnit(left, top);
		this.checkArrangementUpdate();
	}

	toggleEditMode(event: MouseEvent) {
		event.stopPropagation();
		this.editableName = !this.editMode ? this.name : '';
		this.editMode = !this.editMode;
		this.showSaveHint.emit(this.editMode);
	}

	rename(event: MouseEvent) {
		event.stopPropagation();
		if (this.busyTableNames.includes(this.editableName.trim())) {
			this.sayTableError.emit();
			this.tableNameErrorMode = true;
			return;
		}
		if(!this.editableName) {
			this.tableNameErrorMode = true;
			return;
		}
		this.tableNameErrorMode = false;
		if (this.editableName !== this.name) {
			this.name = this.editableName;
			this.updateBoxHandler();
		}
		this.editMode = !this.editMode;
		this.showSaveHint.emit(this.editMode);
	}

	toggleBoxType(): void {
		if (this.editMode) {
			return;
		}
		this.arrangement.boxType = this.arrangement?.boxType === EBoxType.Circle ? EBoxType.Rectangle : EBoxType.Circle;
		this.loadBox();
		this.updateBoxHandler();
	}

	updateBoxHandler(): void {
		this.updateBox.emit({
			boxType: this.arrangement?.boxType,
			height: this.arrangement?.height,
			left: this.arrangement?.left,
			name: this.editableName || this.name,
			top: this.arrangement?.top,
			width: this.arrangement?.width
		})
	}
}
