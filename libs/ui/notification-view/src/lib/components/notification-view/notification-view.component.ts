import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-notification-view',
	templateUrl: './notification-view.component.html',
	styleUrls: ['./notification-view.component.scss']
})
export class NotificationViewComponent implements OnInit {

	constructor(
		private dialogRef: MatDialogRef<NotificationViewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {		
		console.log(data);
	}

	onClose(): void {
		this.dialogRef.close();
	}

	ngOnInit(): void {
	}

}
