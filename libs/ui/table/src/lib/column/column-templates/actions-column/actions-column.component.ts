import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';

export enum ItemStatus {
  Draft = 0,
  Enabled = 1,
  Disabled = 2,
  Deleted = 99,
}

export interface Actions {
  editable: boolean | ((row: any) => boolean);
  deletable: boolean | ((row: any) => boolean);
  activatable?: boolean | ((row: any) => boolean);
  hasViewAs?: boolean | ((row: any) => boolean);
  hasViewAsTooltip?: string;
  hideable?: boolean | ((row: any) => boolean);
  customActions?: {
    tooltip?: string;
    icon: string;
    onClick: (row: any) => void;
  }[]
}

@Component({
  selector: 'app-actions-column',
  templateUrl: './actions-column.component.html',
  styleUrls: ['./actions-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsColumnComponent {
  private _actions: Actions;
  viewAsTooltip = 'ლინკზე გადასვლა';

  @Input()
  set actions(value: Actions) {
    this._actions = value;
    if (this._actions.hasViewAsTooltip) {
      this.viewAsTooltip = this._actions.hasViewAsTooltip;
    }
  }

  get actions(): Actions {
    return this._actions;
  }

  @Input()
  editingRow: any;

  @Input()
  inlineEdit: boolean;

  @Output()
  rowEditToggle = new EventEmitter<any>();

  @Output()
  rowEditSave = new EventEmitter<any>();

  @Output()
  rowDelete = new EventEmitter<any>();

  @Output()
  rowActivateToggle = new EventEmitter<any>();

  @Output()
  rowViewAs = new EventEmitter<any>();

  @Output()
  showHideToggle = new EventEmitter<any>();

  ItemStatus = ItemStatus;

  constructor(public dialog: MatDialog) {}

  onDelete(row: any): void {
    if (!this.inlineEdit) {
      this.rowDelete.emit(row);
      return;
    }
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        data: {
          message: 'დარწმუნებული ხარ რომ გსურს ჭაშლა?',
        },
      })
      .afterClosed()
      .subscribe((result: boolean) => {
        if (result) {
          this.rowDelete.emit(row);
        }
      });
  }

  is(capable: string, row: any): boolean {
    if (!this.actions) return false;
    const action = this.actions[capable];
    return action instanceof Function ? action(row) : action;
  }

  hasAnyAction(row): boolean {
    return (
      this.is('editable', row) ||
      this.is('deletable', row) ||
      this.is('hasViewAs', row) ||
      this.is('hasViewAsTooltip', row) ||
      this.is('activatable', row) ||
      this.is('hideable', row) ||
      this.is('customActions', row)
    );
  }
}
