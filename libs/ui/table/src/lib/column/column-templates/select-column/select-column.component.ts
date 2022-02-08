import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Actions } from '../actions-column/actions-column.component';

@Component({
  selector: 'app-select-column',
  templateUrl: './select-column.component.html',
  styleUrls: ['./select-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectColumnComponent {
  @Input()
  actions: Actions;

  @Input()
  selection: SelectionModel<any>;

  @Input()
  isAllSelected: boolean;

  @Input()
  hasInsideSelectAll: boolean;

  @Input()
  selectableCustomEnable: (row: any) => boolean;

  @Output()
  rowToggle = new EventEmitter<any>();

  @Output()
  selectAllToggle = new EventEmitter<void>();

  selectAllId = Math.random();

  hash(text: string): number {
    let hash = 0;
    let chr: number;
    if (text.length === 0) {
      return hash;
    }
    for (let i = 0; i < text.length; i++) {
      chr = text.charCodeAt(i);
      // tslint:disable-next-line: no-bitwise
      hash = (hash << 5) - hash + chr;
      // tslint:disable-next-line: no-bitwise
      hash |= 0;
    }
    return hash;
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
      this.is('activatable', row) ||
      this.is('hasViewAs', row) ||
      this.is('hideable', row)
    );
  }
}
