import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '@optimo/core';
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { IAdminNotification } from './models/IAdminNotification';
import { IAdminNotificationRespone } from './models/IAdminNotificationRespone';
import { ENotificationItemStatus } from './models/ENotificationItemStatus';
import { NotificationViewComponent } from 'libs/ui/notification-view/src';
import { MatDialog } from '@angular/material/dialog';
interface ITableState {
	pageIndex: number;
	pageSize: number;
	sortField: string;
	sortOrder: string;
	length?: number;
	previousPageIndex?: number;
	name?: string;
	isImportant?: string;
	businessTypes?: string;
	userName?: string;
	createDateFrom?: string;
	createDateTo?: string;
}

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent implements OnInit, OnDestroy {
	protected unsubscribe$ = new Subject<void>();
	selectedRows: IAdminNotification[];
	displayedColumns: ColumnData[] = [
		{
			dataField: 'name',
			columnType: ColumnType.Text,
			caption: 'დასახელება',
			sortable: true,
			filterable: true,
			widthCoefficient: 2,
		},
		{
			dataField: 'isImportant',
			columnType: ColumnType.Dropdown,
			caption: 'მნიშვნელოვანი',
			filterable: true,
			sortable: true,
			data: {
				false: 'არა',
				true: 'კი',
			},
			widthCoefficient: 1,
		},
		{
			dataField: 'businessTypes',
			columnType: ColumnType.Text,
			caption: 'ბიზნესის ტიპი',
			filterable: true,
			sortable: true,
			widthCoefficient: 1,
		},
		{
			dataField: 'userName',
			columnType: ColumnType.Text,
			caption: 'მომხმარებელი',
			filterable: true,
			sortable: true,
			widthCoefficient: 1,
		},
		{
			dataField: 'createDate',
			columnType: ColumnType.Date,
			caption: 'გაგზავნის თარიღი',
			filterable: true,
			sortable: true,
			widthCoefficient: 1,
		},
	];
	curTableState = {
		pageSize: 10,
		pageIndex: 0,
		sortField: 'sendDateTo',
		sortOrder: 'DESC',
	};
	datasource: IAdminNotification[] = [];
	totalCount = 0;

	private _notificationItemStatus = ENotificationItemStatus;

	onRowClick(notification: IAdminNotification) {
		console.log(notification);
		this._matDialog.open(NotificationViewComponent,
			{
				data: {
					name: notification.name,
					description: notification.description,
					isImportant: notification.isImportant,
					sendDate: notification.createDate
				},
				disableClose: true,
				panelClass: ['mat-max-h-680', 'mat-dialog-fullscreen-u-sm', 'mat-w-600', 'mat-w-u-lg-548', 'mat-overflow-hidden']
			}
		);
	}

	onShowHideToggle(notification: IAdminNotification) {
		this.client.put(`notifications/visibility/${notification.id}`).toPromise().then();
		this.datasource = this.datasource.map(el => {
			return {
				...el,
				status: el.id !== notification.id
					? el.status :
					notification.status === this._notificationItemStatus.Disabled
						? this._notificationItemStatus.Enabled
						: this._notificationItemStatus.Disabled
			}
		})
		this.cdr.detectChanges();
	}

	onSelectionChanged(selectionData: SelectionData) {
		this.selectedRows = selectionData.selected;
	}

	goToEdit(notification: IAdminNotification) {
		this.router.navigate(['notifications/edit/', notification.id]);
	}

	onEditSelected() {
		this.router.navigate(['notifications/edit/', this.selectedRows[0].id]);
	}

	onTableStateChanged(newTableState: ITableState) {
		this.curTableState = {
			...this.curTableState,
			...newTableState,
		};
		this.fetchItems(this.curTableState as ITableState);
	}

	fetchItems(tableState: ITableState) {
		const params = new HttpParams({
			fromObject: {
				SortField: tableState.sortField,
				SortOrder: tableState.sortOrder,
				PageIndex: '' + tableState.pageIndex,
				PageSize: '' + tableState.pageSize,
				...(tableState.name && { Name: tableState.name }),
				...(tableState.isImportant && { IsImportant: tableState.isImportant }),
				...(tableState.businessTypes && { BusinesType: tableState.businessTypes }),
				...(tableState.userName && { UserName: tableState.userName }),
				...(tableState.createDateFrom &&
					tableState.createDateTo && {
					CreateDateFrom: tableState.createDateFrom,
					CreateDateTo: tableState.createDateTo,
				}),
			},
		});
		this.client
			.get<IAdminNotificationRespone<IAdminNotification[]>>('notifications', { params })
			.pipe(debounceTime(200), takeUntil(this.unsubscribe$))
			.subscribe(
				(data) => {
					this.datasource = data.data;
					this.totalCount = data.totalCount;
					this.cdr.detectChanges();
					console.log(data);
				},
				(error) => {
					console.log(error);
				}
			);
	}

	constructor(
		private client: ClientService,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private _matDialog: MatDialog,
	) { }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

}
