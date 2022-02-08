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
  selector: 'app-dropdown-multiselect-column',
  templateUrl: './dropdown-multiselect-column.component.html',
  styleUrls: ['./dropdown-multiselect-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMultiselectComponent extends ColumnTemplate
  implements OnInit {
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

  protected updateForm(state: {
    [key: string]: string | number | number[] | string[];
  }): void {
    this.filterForm.patchValue(
      {
        filter:
          typeof state[this.col.dataField] === 'undefined'
            ? []
            : Array.isArray(state[this.col.dataField])
            ? state[this.col.dataField]
            : [state[this.col.dataField]],
      },
      { emitEvent: false }
    );
  }

  onSelectionChange(key: string): void {
    let selected:string[] = this.filterForm.getRawValue().filter;
    if (!selected) {
      selected = [];
    }
    const indexOfKey = selected?.indexOf(key);
    if (indexOfKey && indexOfKey === -1) {
      selected.push(key);
    } else {
      selected.splice(indexOfKey, 1);
    }
    this.filterForm.setValue({
      filter: [...selected],
    });
    this.filterForm.markAsDirty();
    // this.onSubmit(selected.length === 0);
    this.checkFilterChange.next();
  }

  isItemSelected(key: string) {
    return this.filterForm
      .getRawValue()
      ?.filter?.find(
        (value: string | number) => value && value.toString() === key
      );
  }

  get selectedValues(): string[] {
    return (this?.filterForm
      ?.getRawValue()
      ?.filter || [''])?.map((key) => this.col.data[key]);
  }

  get selectedValuesLabel(): string {
    return this.selectedValues?.join(', ') || '';
  }

  get filterSelected(): boolean {
    return this.filterForm?.getRawValue()?.filter?.length;
  }
}
