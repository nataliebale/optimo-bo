import { TranslateService } from '@ngx-translate/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError, first, finalize } from 'rxjs/operators';
import { ClientService } from '@optimo/core';
import { NotificationsService } from '../../../core/services/notifications/notifications.service';
import { SpaceDetailsDialogComponent } from '../../../popups/space-details-dialog/space-details-dialog.component';
import { ISpace } from './models/space';
import { ITable } from './models/table';
import { HttpParams } from '@angular/common/http';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { ISpaceDetailsResponce } from './models/space-details-responce';
import { ESpaceAction } from './models/space-action';
import { TableStatuses } from '../../../core/enums/ETableStatuses.enum';
import { ECommandValidationErrorCode } from '../../../core/enums/ECommandValidationErrorCode';
import { EBoxType } from './models/EBoxType';
import { IUpdateBox } from './models/IUpdateBox';
import { MixpanelService } from '@optimo/mixpanel';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablesComponent implements OnInit, OnDestroy {
  spaces: ISpace[] = [];
  tables: ITable[] = [];
  selectedSpace: ISpace = null;
  selectedSpaceId: number = localStorage.getItem('spaceId')
    ? JSON.parse(localStorage.getItem('spaceId'))
    : null;
  disableAddTableButton = true;
  loading = false;
  showHint = false;
  showSaveHint = false;
  private _unsubscribe$ = new Subject<void>();
  private _defaultParams = new HttpParams({
    fromObject: {
      sortField: 'name',
      sortOrder: 'ASC',
      pageIndex: '0',
      pageSize: '100',
      status: TableStatuses.Enabled.toString(),
    },
  });
  public hitlightLastAddedTable = false;
  constructor(
    private _client: ClientService,
    private _cd: ChangeDetectorRef,
    private _notificator: NotificationsService,
    private _dialog: MatDialog,
    private _translate: TranslateService,
    private _mixpanelService: MixpanelService
  ) {
    this._mixpanelService.track('Tables')
  }

  ngOnInit(): void {
    this.getSpaces(this.selectedSpaceId);
  }

  spaceDetailsDialog(space: ISpace = null): void {
    this._dialog
      .open(SpaceDetailsDialogComponent, {
        width: '548px',
        panelClass: 'dialog-overflow-visible',
        data: {
          space,
          hideRemoveButton: this.spaces.length <= 1,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((spaceDetailsResponce: ISpaceDetailsResponce) => {
        if (spaceDetailsResponce.success) {
          switch (spaceDetailsResponce.spaceAction) {
            case ESpaceAction.Add:
              this.getSpaces(spaceDetailsResponce.space.id);
              break;
            case ESpaceAction.Edit:
              this.getSpaces(spaceDetailsResponce.space.id);
              break;
            default:
              break;
          }
        }
      });
  }

  deleteSpace(space: ISpace): void {
    this._dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'TABLES.WARNING_MESSAGE',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((r) => {
        if (r) {
          this._client
            .delete<any>('spaces', {
              id: space.id,
            })
            .pipe(
              takeUntil(this._unsubscribe$),
              catchError((error) => {
                let message = 'TABLES.GENERAL_ERROR';
                if (
                  error.error.Errors?.DomainErrorCodes.includes(
                    ECommandValidationErrorCode.ShiftIsNotClosed
                  )
                ) {
                  message = 'TABLES.CLOSE_THE_SHIFT_TO_DELETE_SPACE';
                }
                this._notificator.sayError(this._translate.instant(message));
                return EMPTY;
              })
            )
            .subscribe(() => {
              this._notificator.saySuccess(
                this._translate.instant('TABLES.SPACE_DELETED_SUCCESSFULLY')
              );
              const id: number =
                this.selectedSpaceId === space.id
                  ? this.spaces.filter((sp) => sp.id !== space.id)[0].id
                  : this.selectedSpaceId;
              this.getSpaces(id);
            });
        }
      });
  }

  switchTableMode(table: ITable, editMode: boolean): void {
    if (editMode) {
      table.editableTableName = table.name;
      table.tableEditMode = editMode;
    } else {
      table.editableTableName = '';
      table.tableEditMode = editMode;
    }
  }

  showSaveHintChange(value: boolean) {
    this.showSaveHint = value;
  }

  deleteTable(tableId: number, spaceId: number): void {
    this._dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          title: 'DefaultApproveDialog.titleForDelete',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe((r) => {
        if (r) {
          this.loading = true;
          this._client
            .delete<any>('spaces/tables', {
              tableId,
              spaceId,
            })
            .pipe(
              catchError((error) => {
                let message = 'TABLES.GENERAL_ERROR';
                if (
                  error.error.Errors?.DomainErrorCodes.includes(
                    ECommandValidationErrorCode.ShiftIsNotClosed
                  )
                ) {
                  message = 'TABLES.CLOSE_THE_SHIFT_TO_DELETE_TABLE';
                }
                this._notificator.sayError(this._translate.instant(message));
                return EMPTY;
              }),
              takeUntil(this._unsubscribe$),
              finalize(() => (this.loading = false))
            )
            .subscribe(() => {
              this.getSpaces();
              this._notificator.saySuccess(
                this._translate.instant('TABLES.TABLE_DELETED_SUCCESSFULLY')
              );
            });
        }
      });
  }

  getTableNames(tables: ITable[]): string[] {
    return tables.map((el) => el.name);
  }

  addTable() {
    this.disableAddTableButton = true;
    const spaceId = this.selectedSpace.id;
    this._client
      .post<any>('spaces/tables', {
        spaceId,
        width: 96,
        height: 96,
        left: 0,
        top: 0,
        boxType: EBoxType.Rectangle,
      })
      .pipe(
        catchError(() => {
          this.disableAddTableButton = false;
          return EMPTY;
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(() => {
        this.disableAddTableButton = false;
        this.getSpaces(null, true);
      });
  }

  sayTableError(message?: string) {
    const tableErrorMessage = 'TABLES.NAME_EXISTS';
    this._notificator.sayError(
      this._translate.instant(message || tableErrorMessage)
    );
  }

  updateTable(updateBox: IUpdateBox, tableId: number): void {
    const showNameUpdateMessage =
      this.tables.find((el) => el.id === tableId).name !== updateBox.name;
    this._client
      .put<any>('spaces/tables', {
        spaceId: this.selectedSpaceId,
        tableId: tableId,
        tableName: updateBox.name,
        width: updateBox.width,
        height: updateBox.height,
        left: updateBox.left,
        top: updateBox.top,
        boxType: updateBox.boxType,
      })
      .pipe(
        takeUntil(this._unsubscribe$),
        catchError((error) => {
          let message = 'TABLES.GENERAL_ERROR';
          if (
            error.error.Errors?.DomainErrorCodes.includes(
              ECommandValidationErrorCode.TableNameAlreadyExists
            )
          ) {
            this.sayTableError();
          } else {
            this.sayTableError(message);
          }
          return EMPTY;
        })
      )
      .subscribe(() => {
        if (showNameUpdateMessage) {
          this._notificator.saySuccess(
            this._translate.instant('TABLES.NAME_CHANGES_SUCCESSFULLY')
          );
        }
        this.getSpaces();
      });
  }

  onSpaceitemChange(event: ISpace) {
    localStorage.setItem('spaceId', event.id.toString());
    this.selectedSpace = event;
    this.tables = [
      ...this.spaces.find((el) => el.id === this.selectedSpaceId).tables,
    ];
    this._cd.markForCheck();
  }

  private getSpaces(
    selectableId?: number,
    hitlightLastAddedTable?: boolean
  ): void {
    this._client
      .get<any>('spaces', { params: this._defaultParams })
      .pipe(
        catchError(() => {
          return EMPTY;
        }),
        takeUntil(this._unsubscribe$)
      )
      .subscribe(({ data }) => {
        this.spaces = [...data];
        if (selectableId || !this.selectedSpaceId) {
          this.selectSpace(selectableId || this.spaces[0].id);
          this.disableAddTableButton = false;
        }
        this.tables = [
          ...this.spaces.find((el) => el.id === this.selectedSpaceId).tables,
        ];
        if (hitlightLastAddedTable) {
          this.hitlightLastAddedTable = true;
        }
        setTimeout(() => {
          this.hitlightLastAddedTable = false;
        }, 10000);
        this._cd.markForCheck();
      });
  }

  private selectSpace(selectableId: number): void {
    this.selectedSpace = this.spaces.find((el) => el.id === selectableId);
    this.selectedSpaceId = this.selectedSpace.id;
    this._cd.markForCheck();
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }
}
