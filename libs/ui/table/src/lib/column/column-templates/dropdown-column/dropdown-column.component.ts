import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { ColumnTemplate } from '../column-template';
import { DOCUMENT } from '@angular/common';
import { FormBuilder } from '@angular/forms';

import { textIsTruncated } from '../../../utils/text-is-truncated';
@Component({
  selector: 'app-dropdown-column',
  templateUrl: './dropdown-column.component.html',
  styleUrls: ['./dropdown-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownColumnComponent extends ColumnTemplate implements OnInit {
public textIsTruncated = textIsTruncated;
  objectKeys = Object.keys;
  filterForm = this.fb.group({ filter: [''] });
  @Input()
  dropdownKeyForStaticValueSelector: string;
  get selectedKey(): string {
    return this.filterForm.controls.filter.value;
  }

  constructor(
    @Inject(DOCUMENT) document: any,
    cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    super(document, cdr);
  }

  ngOnInit(): void {
    this.listenCheckFilterChange(() => {
      this.changeFilter.emit({
        [this.col.dataField]: this.filterForm.value.filter,
      });
    });
  }

  getStaticPermissionsData(col: any, row: any) {
    if (
      this.dropdownKeyForStaticValueSelector &&
      this.dropdownKeyForStaticValueSelector === col.dataField
    ) {
      return row[this.dropdownKeyForStaticValueSelector];
    } else {
      return col.data[row[col.dataField]];
    }
  }

  protected updateForm(state: { [key: string]: string | number }): void {
    this.filterForm.patchValue(
      {
        filter: state[this.col.dataField],
      },
      { emitEvent: false }
    );
  }

  onSelectionChange(key: string): void {
    this.filterForm.setValue({
      filter: key,
    });
    this.filterForm.markAsDirty();
    this.onSubmit();
  }
}
