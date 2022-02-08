import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import { ColumnTemplate } from '../column-template';
import { DOCUMENT, formatDate } from '@angular/common';
import { formatRFC3339 } from 'date-fns';
import { FormBuilder } from '@angular/forms';

import { textIsTruncated } from '../../../utils/text-is-truncated';
interface Data {
  type?: 'date' | 'dateTime';
  maxDate?: Date;
}

@Component({
  selector: 'app-date-column',
  templateUrl: './date-column.component.html',
  styleUrls: ['./date-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateColumnComponent extends ColumnTemplate implements OnInit {
public textIsTruncated = textIsTruncated;
  dateRange: Date | Date[];
  displayedFilter = '';
  filterForm = this.fb.group(
    { from: [''], to: [''] }
    // {
    //   validator: CustomValidators.fullOrEmpty()
    // }
  );

  get format(): string {
    const data: Data = this.col.data || {};
    return data.type === 'dateTime' ? 'd MMM yy, HH:mm' : 'd MMM yy';
  }

  constructor(
    @Inject(DOCUMENT) document: any,
    cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    @Inject(LOCALE_ID) private locale: string
  ) {
    super(document, cdr);
  }

  ngOnInit(): void {
    this.listenCheckFilterChange(() => {
      this.changeFilter.emit({
        [`${this.col.dataField}From`]:
          this.filterForm.value.from &&
          formatRFC3339(this.filterForm.value.from),
        [`${this.col.dataField}To`]:
          this.filterForm.value.to && formatRFC3339(this.filterForm.value.to),
      });

      this.updateDisplayedFilter();
    });
  }

  protected updateForm(state: { [key: string]: string | number }): void {
    this.filterForm.patchValue(
      {
        from:
          state[`${this.col.dataField}From`] &&
          new Date(state[`${this.col.dataField}From`]),
        to:
          state[`${this.col.dataField}To`] &&
          new Date(state[`${this.col.dataField}To`]),
      },
      { emitEvent: false }
    );
    this.updateDisplayedFilter();
  }

  private updateDisplayedFilter(): void {
    if (this.filterForm.value.from && this.filterForm.value.to) {
      this.displayedFilter = `${formatDate(
        this.filterForm.value.from,
        'd MMM yy',
        this.locale
      )} - ${formatDate(this.filterForm.value.to, 'd MMM yy', this.locale)}`;
    } else {
      this.displayedFilter = '';
    }
  }

  onRangeChange(dateRange: Date | Date[]) {
    this.dateRange = dateRange;
    this.filterForm.setValue({
      from: (dateRange && dateRange[0]) || null,
      to: (dateRange && dateRange[1]) || null,
    });
    this.filterForm.markAsDirty();
  }
}
