import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { INotification } from '../../models/INotification';

@Component({
	selector: 'app-notification-list',
	templateUrl: './notification-list.component.html',
	styleUrls: ['./notification-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit, OnDestroy {
	@Input() notifications: INotification[];
	@Output() openNotification: EventEmitter<INotification> = new EventEmitter();
	@Output() onScroll: EventEmitter<boolean> = new EventEmitter();
	constructor(private renderer: Renderer2) {
		this.renderer.addClass(document.body, 'notification-list-open');
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.renderer.removeClass(document.body, 'notification-list-open');
	}

}
