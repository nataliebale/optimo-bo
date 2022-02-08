import { Component, Input } from '@angular/core';
import { PackageType } from '../../request/form/package-type.enum';

export interface TableData {
  title: string;
  rows: TableRow[];
}

export interface TableRow {
  title: string;
  basic: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
}
@Component({
  selector: 'app-packages-table',
  templateUrl: './packages-table.component.html',
})
export class PackagesTableComponent {
  @Input()
  data: TableData;

  @Input()
  shownColl: PackageType;

  packageType = PackageType;

  isIcon(row: TableRow, cell: 'basic' | 'standard' | 'premium'): boolean {
    return typeof row[cell] === 'boolean';
  }

  isCollShown(type: PackageType): boolean {
    return this.shownColl === type || this.shownColl === undefined;
  }
}
