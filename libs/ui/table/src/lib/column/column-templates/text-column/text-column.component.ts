import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { ColumnTemplate } from '../column-template';
import { DOCUMENT } from '@angular/common';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-text-column',
  templateUrl: './text-column.component.html',
  styleUrls: ['./text-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextColumnComponent extends ColumnTemplate implements OnInit {
  filterForm = this.fb.group({ filter: [''] });

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

  protected updateForm(state: { [key: string]: string | number }): void {
    console.log(
      'TextColumnComponent -> updateForm -> state[this.col.dataField]',
      state[this.col.dataField]
    );
    this.filterForm.patchValue(
      {
        filter: state[this.col.dataField] || '',
      },
      { emitEvent: false }
    );
  }
}
