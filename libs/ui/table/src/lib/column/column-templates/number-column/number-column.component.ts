import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { DOCUMENT, formatNumber } from '@angular/common';
import { ColumnTemplate } from '../column-template';
import { FormBuilder } from '@angular/forms';
import { textIsTruncated } from '../../../utils/text-is-truncated';

export enum MeasurementUnit {
  Piece = 1,
  Kilogram,
  Liter,
  Meter,
  SquareMeter,
  Gram,
  Milliliter,
}

export function getUMOAcronym(UMO: MeasurementUnit): string {
  switch (UMO) {
    case MeasurementUnit.Piece: {
      return 'ც';
    }
    case MeasurementUnit.Kilogram: {
      return 'კგ';
    }
    case MeasurementUnit.Liter: {
      return 'ლ';
    }
    case MeasurementUnit.Meter: {
      return 'მ';
    }
    case MeasurementUnit.SquareMeter: {
      return 'კვ.მ';
    }
    case MeasurementUnit.Gram: {
      return 'გ';
    }
    case MeasurementUnit.Milliliter: {
      return 'მლ';
    }
    default:
      return '';
  }
}

export enum NumberColumnType {
  Float,
  Percent,
  Decimal,
  Quantity,
  Currency,
  FullNumber,
}

interface Data {
  type: NumberColumnType;
  statusFieldName?: string;
  UOMFieldName?: string;
  isHeaderRight?: boolean;
  prefix?: string;
  digitsAfterDot?: number;
  styleContent?: (row: any) => string[];
}

@Component({
  selector: 'app-number-column',
  templateUrl: './number-column.component.html',
  styleUrls: ['./number-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberColumnComponent extends ColumnTemplate implements OnInit {
public textIsTruncated = textIsTruncated;
  get data(): Data {
    const def = {
      type: NumberColumnType.Float,
      isHeaderRight: !this.col.sortable,
    };

    if (this.col.data) {
      return {
        ...def,
        ...this.col.data,
      };
    }

    return def;
  }

  displayedFilter = '';
  numberColumnType = NumberColumnType;
  filterForm = this.fb.group(
    { from: [''], to: [''] }
    // {
    //   validator: CustomValidators.fullOrEmpty()
    // }
  );

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
        [`${this.col.dataField}From`]: this.filterForm.value.from,
        [`${this.col.dataField}To`]: this.filterForm.value.to,
      });
      this.updateDisplayedFilter();
    });
  }

  protected updateForm(state: { [key: string]: string | number }): void {
    this.filterForm.patchValue(
      {
        from: state[`${this.col.dataField}From`],
        to: state[`${this.col.dataField}To`],
      },
      { emitEvent: false }
    );
    this.updateDisplayedFilter();
  }

  private updateDisplayedFilter(): void {
    if (this.filterForm.value.from || this.filterForm.value.to) {
      this.displayedFilter = `${this.filterForm.value.from || '∞'} - ${
        this.filterForm.value.to || '∞'
      }`;
    } else {
      this.displayedFilter = '';
    }
  }

  getShownNumber(row: any): string {
    const cell = row[this.col.dataField];
    const digitsAfterDot = this.data.digitsAfterDot ?? 2;
    switch (this.data.type) {
      case NumberColumnType.Float: {
        return formatNumber(cell, 'en', '1.4-4');
      }
      case NumberColumnType.Percent: {
        return (
          formatNumber(cell, 'en', `1.${digitsAfterDot}-${digitsAfterDot}`) +
          '%'
        );
      }
      case NumberColumnType.Decimal: {
        const value = formatNumber(
          cell,
          'en',
          `1.${digitsAfterDot}-${digitsAfterDot}`
        );

        return value === '∞'
          ? '—'
          : value + (this.data.prefix ? ' ' + this.data.prefix : '');
      }
      case NumberColumnType.Quantity: {
        const UMO = row[this.data.UOMFieldName];
        return `${formatNumber(cell, 'en', '1.4-4')} ${getUMOAcronym(UMO)}`;
      }
      case NumberColumnType.Currency: {
        return `${formatNumber(cell, 'en', `1.${digitsAfterDot || 4}-${digitsAfterDot || 4}`)} ₾`;
      }
      case NumberColumnType.FullNumber: {
        return `${formatNumber(cell, 'en', `1.0-0`)}`;
      }
    }
  }

  get className(): object {
    return {
      'table-text-dark font-family-regular':
        this.data.type === NumberColumnType.Decimal,
      'table-text-dark': this.data.type !== NumberColumnType.Decimal,
      [this.col.className]: true,
    };
  }

  classNameArr = (row): string[] => {
    return [
      '',
      ...(this.data?.styleContent ? this.data?.styleContent(row) : []),
    ];
  }
}
