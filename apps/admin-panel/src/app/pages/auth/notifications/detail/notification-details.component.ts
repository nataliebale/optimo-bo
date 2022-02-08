import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ClientService } from '@optimo/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { IAdminNotificationDetails } from '../models/IAdminNotificationDetails';
import { QlModules } from './quill-modules';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { MatDialog } from '@angular/material/dialog';
import { NotificationViewComponent } from 'libs/ui/notification-view/src';
import * as QuillNamespace from 'quill';
let Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
Quill.register('modules/imageResize', ImageResize);
@Component({
	selector: 'app-notification-details',
	templateUrl: './notification-details.component.html',
	styleUrls: ['./notification-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	form: FormGroup;
	offerPhoto: any;
	editId: number;
	pdfUrl: string;
	notificationDetails: IAdminNotificationDetails;
	offerContent: String;

	isSubmited: boolean;

	editorFocused: boolean;

	copiedTooltipVisible = false;

	// snowTheme = SnowTheme;
	qlModules = QlModules;
	editor_modules = {
		toolbar: [
			[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
			//   [{ header: [1, 2, 3, 4, 5, 6, false] }],

			['bold', 'italic', 'underline',],// 'strike'], // toggled buttons
			//   ['blockquote', 'code-block'],

			//   [{ header: 1 }, { header: 2 }], // custom button values

			[
				{ color: [] },
				// { background: [] }
			], // dropdown with defaults from theme
			[{ list: 'bullet' }, { list: 'ordered' },],
			//   [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
			// [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
			// [{ direction: 'rtl' }], // text direction

			//   [{ font: [] }],
			[{ align: [] }],

			//   ['clean'], // remove formatting button

			['link', 'image'],// 'image', 'video'] // link and image, video
		],
		imageResize: true
	}
	constructor(
		private _bottomSheetRef: MatBottomSheetRef<NotificationDetailsComponent>,
		private _formBuilder: FormBuilder,
		private _clientService: ClientService,
		@Inject(MAT_BOTTOM_SHEET_DATA) private params: any,
		public _cd: ChangeDetectorRef,
		private _matDialog: MatDialog,
	) {
	}

	listenAllBusinessTypes(): void {
		this.form.get("allBusinessTypes").valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
			
		const businessTypesControl = this.form.get('businessTypes') as FormControl;
		if(value) {
			businessTypesControl.setValue(null);
			businessTypesControl.setValidators(null);
			businessTypesControl.disable();
		} else {
			businessTypesControl.setValidators(Validators.required);
			businessTypesControl.enable();
		}
		businessTypesControl.updateValueAndValidity();
		 })
	}

	approveSend() {
		this._matDialog
			.open(ApproveDialogComponent, {
				width: '548px',
				data: {
					title: `ნამდვილად გსურს გაგზავნა?`,
					approveBtnLabel: 'კი',
					denyBtnLabel: 'არა'
				},
			})
			.afterClosed()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((result) => {
				if (result) {
					this.sendNotification();
				}
			});
	}

	ngOnInit(): void {
		this.editId = this.params && this.params.id;
		if (this.editId) {
			this.getItemForEdit();
		} else {
			this.createForm(null);
			
			this.listenAllBusinessTypes();
		}
	}

	public openNotification(): void {
		const formRawValues = this.form.getRawValue();
		this._matDialog.open(NotificationViewComponent,
			{
				data: {
					name: formRawValues?.name || '',
					description: formRawValues?.description || '',
					isImportant: formRawValues?.isImportant || false,
					sendDate: new Date()
				},
				disableClose: true,
				panelClass: ['mat-max-h-680', 'mat-dialog-fullscreen-u-sm', 'mat-w-600', 'mat-w-u-lg-548', 'mat-overflow-hidden']
			}
		);
	}

	getBusinessTypes = (state: any): Observable<any> => {
		let params = new HttpParams({
			fromObject: {
				sortField: 'name',
				sortOrder: 'ASC',
				pageIndex: state.pageIndex,
				pageSize: state.pageSize,
			},
		});

		if (state.searchValue) {
			params = params.append('name', state.searchValue);
		}

		return this._clientService.get<any>('businesstypes', { params });
	};

	getBusinessTypeById = (id: number): Observable<any> => {
		return this._clientService.get<any>(`businesstypes/${id}`);
	};

	createForm(notificationDetails: IAdminNotificationDetails) {
		this.form = this._formBuilder.group({
			name: [notificationDetails && notificationDetails.name, [Validators.required]],
			description: [notificationDetails && notificationDetails.description],
			isImportant: [(notificationDetails && notificationDetails.isImportant) || false],
			isForTesting: [(notificationDetails && notificationDetails.isForTesting) || false],
			allBusinessTypes: [(notificationDetails && notificationDetails.allBusinessTypes) || false],
			businessTypes: [notificationDetails && notificationDetails.businessTypes, [Validators.required]]
		});
		if(notificationDetails) {
			const self = this;
			setTimeout(() => {
				self.form.get('isForTesting').disable();	
			});
			if(notificationDetails.allBusinessTypes) {
				setTimeout(() => {
					const businessTypesControl = self.form.get('businessTypes') as FormControl;
					businessTypesControl.setValidators(null);
					businessTypesControl.disable();
				});
			}
		}
		console.log('form values:', this.form.getRawValue());
		this._cd.markForCheck();
	}

	onCancel() {
		this.close();
	}

	getItemForEdit(): void {
		this._clientService
			.get(`notifications/${this.editId}`)
			.pipe(
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe((result: IAdminNotificationDetails) => {
				if (!result) {
					this.close();
				}
				this.notificationDetails = result;
				this.createForm(result);			
				this.listenAllBusinessTypes();
			});
	}

	private close(): void {
		this._bottomSheetRef.dismiss(
			'/notifications'
		);
	}

	sendNotification(): void {
		const formRawValues = this.form.getRawValue();
		console.log('save form', formRawValues);


		const requestBody = {
			id: this?.notificationDetails?.id,
			name: formRawValues.name,
			description: formRawValues.description,
			isImportant: formRawValues.isImportant,
			businessTypes: formRawValues.businessTypes,
			isForTesting: formRawValues.isForTesting,
			allBusinessTypes: formRawValues.allBusinessTypes,
		};

		const request = this.editId ? this._clientService.put<any>(
			'notifications',
			requestBody,
		) : this._clientService.post<any>(
			'notifications',
			requestBody,
		);

		request
			.pipe(
				catchError(() => {
					return EMPTY;
				}),
				takeUntil(this.unsubscribe$)
			)
			.subscribe((result) => {
				if (!result) {
					this.onCancel();
				}
				console.log('saved item: ', result);
				this.close();
			});
	}

	async onSubmit() {
		this.isSubmited = true;
		this.form.markAllAsTouched();
		if (this.form.invalid) {
			this._cd.markForCheck();
			console.log('form is invalid');
			return;
		}
		this.approveSend();
	}

	updateQuillValidity() {
		this.form.get('description').updateValueAndValidity();
	}

	get showInvalidMessage(): boolean {
		console.log('show invalid message', this.isSubmited, this.form?.invalid);
		return this.isSubmited && this.form?.invalid;
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}


}
