import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { ColumnData, ColumnType, SelectionData } from '@optimo/ui-table';
import { MatDialog } from '@angular/material/dialog';
import { ApproveDialogComponent } from '@optimo/ui-popups-approve-dialog';
import { AddInventoryItemImeiAddPopupComponent } from './add-popup/add-inventory-item-imei-add-popup.component';
import { uniq } from 'lodash-es';
import { ExcelService } from '../../../../../core/services/excel/excel.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-inventory-item-imeis',
  templateUrl: './add-inventory-item-imeis.component.html',
  styleUrls: ['./add-inventory-item-imeis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInventoryItemImeisComponent implements OnDestroy {
  private _imeis: string[] = [];

  @Input()
  set imeis(value: string[]) {
    if (!value) {
      return;
    }
    this._imeis = value;
    this.dataSource =
      this.imeis &&
      this.imeis.map((i) => ({
        IMEI: i,
      }));
  }

  get imeis(): string[] {
    return this._imeis;
  }

  @Output()
  imeisChange: EventEmitter<string[]> = new EventEmitter<string[]>();

  dataSource: any[];

  selectedRows: any[];

  displayedColumns: ColumnData[] = [
    {
      dataField: 'IMEI',
      columnType: ColumnType.Text,
      caption: 'დასახელება',
      filterable: false,
      sortable: true,
      widthCoefficient: 1,
    },
  ];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private excelService: ExcelService
  ) {}

  onDetail(row?: any): void {
    this.dialog
      .open(AddInventoryItemImeiAddPopupComponent, {
        width: '548px',
        data: { editIMEI: (row && row.IMEI) || null, IMEIs: this.imeis },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          let withoutOld = this.imeis;
          if (row) {
            withoutOld = this.imeis.filter((i) => i !== row.IMEI);
          }
          this.imeis = [...withoutOld, result];
          this.imeisChange.emit(this.imeis);
          this.cdr.markForCheck();
        }
      });
  }

  onRemove(row?: any): void {
    this.dialog
      .open(ApproveDialogComponent, {
        width: '548px',
        // data: {
        //   title: `ნამდვილად გსურს "${
        //     (row && row.IMEI) || this.titlesOfSelectedItems
        //   }"-ს წაშლა?`,
        // },
        data: {
          title: `ნამდვილად გსურს წაშლა?`,
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          const rm = row ? [row.IMEI] : this.selectedRows.map((r) => r.IMEI);
          this.imeis = this.imeis.filter((i) => {
            return !rm.includes(i);
          });
          this.imeisChange.emit(this.imeis);
          this.cdr.markForCheck();
        }
      });
  }

  onExport(): void {
    console.log('bugs => datasource', this.dataSource);
    this.excelService.exportAsExcelFile(
      this.dataSource || [{ IMEI: null }],
      'IMEIs'
    );
  }

  onImport(fileList: any): void {
    const file = fileList && fileList[0];
    this.excelService
      .importAsArray(file)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.imeis = uniq(data.filter((item) => item !== 'IMEI'));
        this.imeisChange.emit(this.imeis);
        this.cdr.markForCheck();
      });
  }

  onSelectionChanged(selectionData: SelectionData): void {
    this.selectedRows = selectionData.selected;
  }

  get titlesOfSelectedItems(): string {
    let title = this.selectedRows.map((row) => row.IMEI).join(', ');

    if (title.length > 50) {
      title = `${title.slice(0, 50)}...`;
    }

    return title;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
