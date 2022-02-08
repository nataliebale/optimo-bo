import { TranslateService } from '@ngx-translate/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ClientService } from '@optimo/core';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { NotificationsService } from 'apps/dashboard/src/app/core/services/notifications/notifications.service';
import { ESpaceAction } from 'apps/dashboard/src/app/pages/auth/tables/models/space-action';
import { ISpaceDetails } from 'apps/dashboard/src/app/pages/auth/tables/models/space-details';
import { ISpaceDetailsResponce } from 'apps/dashboard/src/app/pages/auth/tables/models/space-details-responce';
import { EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-space-details-dialog',
  templateUrl: './space-details-dialog.component.html',
  styleUrls: ['./space-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaceDetailsDialogComponent implements OnInit, OnDestroy {
  spaceDetailsForm: FormGroup;
  disableSubmitButton: boolean;
  editMode = false;
  private _unsubscribe$ = new Subject<void>();
  editId: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ISpaceDetails,
    private _dialogRef: MatDialogRef<SpaceDetailsDialogComponent>,
    private _cd: ChangeDetectorRef,
    private _client: ClientService,
    private _dialog: MatDialog,
    private _fb: FormBuilder,
    private _notificator: NotificationsService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.data.space) {
      this.editMode = true;
    }
    this.createForm();
  }

  disableIftextIsSame(str: string) {
    return this.data.space && this.data.space.name === str;
  }

  private createForm(): void {
    this.spaceDetailsForm = this._fb.group({
      name: [this.editMode ? this.data.space.name : '', Validators.required],
    });
    this._cd.markForCheck();
  }

  onSubmit(): void {
    let httpRequestPayload;
    let httpRequest;
    let successMessage = '';
    const url = 'spaces';
    if (this.spaceDetailsForm.invalid) {
      return;
    }
    if (this.editMode) {
      httpRequestPayload = {
        id: this.data.space.id,
        name: this.spaceDetailsForm.controls.name.value,
      };
      httpRequest = this._client.put;
      successMessage = 'TABLES.CHANGED_SUCCESSFULLY';
    } else {
      httpRequestPayload = {
        name: this.spaceDetailsForm.controls.name.value,
      };
      httpRequest = this._client.post;
      successMessage = 'TABLES.SPACE_ADD_SUCCESSFULLY';
    }

    this.disableSubmitButton = true;
    httpRequest
      .bind(this._client)(url, httpRequestPayload)
      .pipe(
        catchError((err) => {
          this.disableSubmitButton = false;
          return EMPTY;
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((result) => {
        const newSpaceOrJustSuccess = result || true;
        this._notificator.saySuccess(this._translate.instant(successMessage));
        this.disableSubmitButton = false;
        const responce: ISpaceDetailsResponce = {
          space: result && result.id ? result : this.data.space,
          spaceAction:
            result && result.id ? ESpaceAction.Add : ESpaceAction.Edit,
          success: true,
        };
        this._dialogRef.close(responce);
      });
  }

  onCancel(): void {
    const responce: ISpaceDetailsResponce = {
      space: null,
      spaceAction: null,
      success: false,
    };
    if (this.spaceDetailsForm.pristine) {
      this._dialogRef.close(responce);
      return;
    }
    this._dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'DefaultApproveDialog.title',
          message: 'DefaultApproveDialog.message',
          approveBtnLabel: 'DefaultApproveDialog.yes',
          denyBtnLabel: 'DefaultApproveDialog.no',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((r) => {
        if (r) {
          this._dialogRef.close(responce);
        }
      });
  }

  get title(): string {
    return this.data.space ? 'TABLES.EDIT_SPACE' : 'TABLES.ADD_SPACE';
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
