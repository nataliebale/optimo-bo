import {
  Component,
  OnInit,
  Input,
  Optional,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter
} from '@angular/core';
import { CdkColumnDef, CdkTable } from '@angular/cdk/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { textIsTruncated } from '../utils/text-is-truncated';
@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnComponent implements OnInit {
public textIsTruncated = textIsTruncated;
  @ViewChildren(CdkColumnDef)
  columnDefs: QueryList<CdkColumnDef>;

  @ContentChild('headerCell')
  headerCellTmpl: TemplateRef<any>;

  @ContentChild('cell')
  cellTmpl: TemplateRef<any>;

  @ContentChild('filterCell')
  filterCellTmpl: TemplateRef<any>;

  @Input()
  widthPercent: number;

  @Input()
  dataField: string;

  @Input()
  caption: string;

  @Input()
  asyncCaption: Observable<string>;

  @Input()
  sortable = true;

  @Input()
  sticky: boolean;

  @Input()
  stickyEnd: boolean;

  @Input()
  hidden: boolean;

  @Input()
  isHeaderRight: boolean;

  @Input()
  className: string;

  constructor(
    @Optional() private table: CdkTable<any>,
    @Optional() public sort: MatSort,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.table) {
      this.cdr.detectChanges();
      this.columnDefs.forEach(col => {
        this.table.addColumnDef(col);
      });
    }
  }
}
