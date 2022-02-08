import { TranslateService } from '@ngx-translate/core';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, Subject } from 'rxjs';
import { CellDirective } from './directives/cell.directive';
import { HeaderCellDirective } from './directives/header-cell.directive';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { CdkTable, CdkHeaderRowDef, CdkRowDef } from '@angular/cdk/table';
import { PaginatorComponent } from './paginator/paginator.component';
import { Actions } from './column/column-templates/actions-column/actions-column.component';
import { takeUntil } from 'rxjs/operators';
import { isEmpty, cloneDeep } from 'lodash-es';

export enum ColumnType {
  Number,
  Text,
  Date,
  Select,
  Dropdown,
  Actions,
  Index,
  DropdownMultiselect,
}

export interface ColumnData {
  dataField: string;
  columnType: ColumnType;
  caption: string;
  asyncCaption?: Observable<string>;
  filterable: boolean;
  sortable: boolean;
  editable?: boolean;
  data?: any;
  widthCoefficient?: number;
  widthPercent?: number;
  hidden?: boolean;
  canNotChangeVisibility?: boolean;
  hideInVisibilitySelector?: boolean;
  className?: string;
}

export interface SelectionData {
  selected: any[];
  isAllSelected: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  private _displayedColumns: Array<ColumnData>;

  @ViewChild(PaginatorComponent)
  _internalPaginator: PaginatorComponent;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(CdkTable, { static: true }) table: CdkTable<any>;

  @ViewChildren(forwardRef(() => CellDirective))
  rowEditCellTmpls: QueryList<CellDirective>;

  @ContentChild(CdkRowDef, { static: true })
  rowDefTmpl: CdkRowDef<any>;

  @ContentChild(CdkHeaderRowDef, { static: true })
  headerRowDefTmpl: CdkHeaderRowDef;

  @ContentChildren(forwardRef(() => CellDirective))
  cellTmpls: QueryList<CellDirective>;

  @ContentChildren(forwardRef(() => HeaderCellDirective))
  headerCellTmpls: QueryList<HeaderCellDirective>;

  private _dataSource: MatTableDataSource<any>;

  @Input()
  set dataSource(value: any) {
    // console.log('set dataSource => value', value);
    // console.log('set dataSource => this._dataSource', this._dataSource);
    if (!this._dataSource) {
      this._dataSource = new MatTableDataSource<any>(value);
    } else {
      this._dataSource.data = value;
    }
    this.loading = false;
    if (this.selection) {
      this.selection.clear();
      this.emitSelectionChanged();
    }
  }

  get dataSource(): any {
    return this._dataSource;
  }

  @Input()
  totalCount: number;

  @Input()
  dropdownKeyForStaticValueSelector: string;

  @Input()
  selectable = true;

  @Input()
  actions: Actions;

  @Input()
  indexable: boolean;

  @Input()
  sortable = true;

  @Input()
  paginable = true;

  @Input()
  staticData: boolean;

  @Input()
  filterable = true;

  @Input()
  defaultSort: string;

  @Input()
  defaultSortDirection: 'ASC' | 'DESC' = 'ASC';

  @Input()
  border = true;

  @Input()
  set displayedColumns(value: Array<ColumnData>) {
    const totalCoefficients = value.reduce(
      (prev, curr) => prev + (curr.widthCoefficient || 1),
      0
    );
    this._displayedColumns = value.map((col) => {
      if (col.widthCoefficient !== null) {
        col.widthPercent =
          ((col.widthCoefficient || 1) / totalCoefficients) * 100;
      }
      return col;
    });

    this.displayedDateColumns = this._displayedColumns.filter(
      (col) =>
        col.columnType !== ColumnType.Select &&
        col.columnType !== ColumnType.Actions
    );
  }

  get displayedColumns(): Array<ColumnData> {
    return this._displayedColumns;
  }

  private _state: { [key: string]: string | number };

  @Input('state')
  set state(value: { [key: string]: string | number }) {
    const alreadyExisted = !!this._state;
    //need cloneDeep for unlink input inner referances
    this._state = cloneDeep(value);
    this.updatePaginatorState();
    this.updateSortState();

    if (
      alreadyExisted &&
      (isEmpty(value) ||
        !value?.sortField ||
        !value?.sortOrder ||
        !value?.pageSize ||
        (!value?.pageIndex && value?.pageIndex !== 0))
    ) {
      this.initDefaultState();
    }
  }

  get state(): { [key: string]: string | number } {
    return this._state;
  }

  @Input()
  pageSizeOptions = [10, 25, 50, 100];

  @Input()
  inlineEdit: boolean;

  @Input()
  hasColumnSelector: boolean;

  @Input()
  hasInsideSelectAll = true;

  @Input()
  multipleSelect = true;

  @Input('externalPaginator')
  _externalPaginator: PaginatorComponent;

  @Output()
  stateChanged = new EventEmitter<{ [key: string]: string | number }>();

  @Output()
  selectionChanged = new EventEmitter<SelectionData>();

  @Output()
  rowClick = new EventEmitter<any>();

  @Output()
  rowActivate = new EventEmitter<any>();

  @Output()
  rowEdit = new EventEmitter<any>();

  @Output()
  rowViewAs = new EventEmitter<any>();

  @Output()
  rowDelete = new EventEmitter<any>();

  @Output()
  showHideToggle = new EventEmitter<any>();

  private unsubscribe$ = new Subject<void>();
  selection: SelectionModel<any>;
  columnType = ColumnType;
  private editRowForm: FormGroup;
  editingRow: any;
  displayedDateColumns: Array<ColumnData>;
  hovered: string;
  loading: boolean;

  @Input()
  selectableCustomEnable: (row: any) => boolean = (row) => row && false;

  constructor(
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.table && this.rowDefTmpl) {
      this.table.addRowDef(this.rowDefTmpl);
    }
    this.initTable();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((e) => this.updateState(e));
    }

    this.updatePaginatorState();
    this.updateSortState();

    this.initDefaultState();
    if (this.staticData) {
      if (this.sortable) {
        this._dataSource.sort = this.sort;
      }
      if (this.paginable) {
        this._dataSource.paginator = this.paginator;
      }
    }
    console.log(
      'TCL: TableComponent -> this.headerRowDefTmpl',
      this.headerRowDefTmpl
    );
  }

  private initDefaultState(): void {
    this.updateState({
      sortField: this.sortField,
      sortOrder: this.defaultSort && this.sortDirection.toLocaleUpperCase(),
      pageIndex: this.paginable && this.paginator.pageIndex,
      pageSize: this.paginable && this.paginator.pageSize,
    });
  }

  private initTable(): void {
    if (this.selectable) {
      this.displayedColumns.unshift({
        dataField: 'select',
        columnType: ColumnType.Select,
        caption: 'Select',
        filterable: false,
        sortable: false,
        editable: false,
      });
      this.selection = new SelectionModel<any>(this.multipleSelect);
    }
    if (this.indexable) {
      this.displayedColumns.unshift({
        dataField: '_index',
        columnType: ColumnType.Index,
        caption: '#',
        filterable: false,
        sortable: false,
        editable: false,
      });
    }
    if (this.actions) {
      this.displayedColumns.push({
        dataField: 'actions',
        columnType: ColumnType.Actions,
        caption: '',
        filterable: false,
        sortable: false,
        editable: false,
      });
      if (this.inlineEdit) {
        this.createEditRowForm();
      }
    }
  }

  private createEditRowForm(): void {
    const controlsConfig = this.displayedDateColumns.reduce(
      (prev: any, curr: any, i: number) => {
        if (i === 1) {
          return { [prev.dataField]: [''], [curr.dataField]: [''] };
        }
        return { ...prev, [curr.dataField]: [''] };
      }
    );
    console.log(
      'TCL: TableComponent -> constructor -> controlsConfig',
      controlsConfig
    );

    this.editRowForm = this.formBuilder.group(controlsConfig);
  }

  private updateState(data: object): void {
    // console.log('bugs => table update state data:', data);
    if (!this.staticData) {
      this.loading = true;
    }
    this.cdr.detectChanges(); // required
    data = { pageIndex: 0, ...data };
    const state = { ...this.state, ...data }; //pickBy({ ...this.state, ...data }, val => val || val === 0);
    console.log('TCL: TableComponent -> this.state', state);
    this.stateChanged.emit(state);
  }

  private emitSelectionChanged(): void {
    this.selectionChanged.emit({
      selected: this.selection.selected,
      isAllSelected: this.isAllSelected,
    });
    this.cdr.detectChanges();
  }

  onSortChange({ active, direction }: Sort): void {
    if (this.paginable) {
      this.paginator.pageIndex = 0;
    }
    if (active && direction) {
      this.updateState({
        sortField: active,
        sortOrder: direction.toUpperCase(),
      });
    } else {
      const sortField = this.defaultSortDirection && this.defaultSort;
      let sortOrder = this.defaultSort && this.defaultSortDirection;
      if (sortField === active) {
        sortOrder = 'ASC';
      }

      this.updateState({
        sortField,
        sortOrder,
      });
    }
  }

  onRowSelectionToggle(row: any): void {
    this.selection.toggle(row);
    this.emitSelectionChanged();
  }

  is(capable: string, row: any): boolean {
    // console.log('bugs => actions row: ', row, 'actions: ', this.actions);
    if (!this.actions) return false;
    const action = this?.actions[capable];
    return action instanceof Function ? action(row) : action;
  }

  hasAnyAction(row): boolean {
    return (
      this.is('editable', row) ||
      this.is('deletable', row) ||
      this.is('hasViewAs', row) ||
      this.is('activatable', row) ||
      this.is('hideable', row)
    );
  }

  onSelectAllToggle(): void {
    this.isAllSelected
      ? this.selection.clear()
      : this.dataSource.data.forEach(
          (row) =>
            (this.hasAnyAction(row) || this.selectableCustomEnable(row)) &&
            this.selection.select(row)
        );
    this.emitSelectionChanged();
  }

  onChangeFilter(filter: object): void {
    this.updateState(filter);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onRowEditToggle(row: any): void {
    if (!this.inlineEdit) {
      this.rowEdit.emit(row);
      return;
    }
    if (this.editingRow === row) {
      this.editingRow = null;
      return;
    }
    this.editingRow = row;

    this.doEachControl((control: AbstractControl, key: string) => {
      control.setValue(row[key]);
    });
  }

  onRowEditSave(row: any): void {
    this.doEachControl((control: AbstractControl, key: string) => {
      row[key] = control.value;
    });
    this.onRowEditToggle(row);
  }

  onRowDelete(row: any): void {
    if (!this.inlineEdit) {
      this.rowDelete.emit(row);
      return;
    }
    const rowIndex = this.dataSource.data.indexOf(row);
    this.dataSource.data.splice(rowIndex, 1);
    this.dataSource = this.dataSource.data;
  }

  onRowShowHide(row: any): void {
    this.showHideToggle.emit(row);
  }

  onRowViewAs(row: any): void {
    this.rowViewAs.emit(row);
  }

  isFieldEditable(row: any, name: string): boolean {
    if (this.editingRow !== row) {
      return false;
    }

    const col = this.displayedColumns.find((c) => c.dataField === name);
    return col && col.editable;
  }

  get isAllSelected(): boolean {
    // return (
    //   this.selection.selected.length === this.dataSource.data.length &&
    //   (this.selection.selected.length || this.dataSource.data.length)
    // ); // no longer valid as select all only selects selectable items
    const selectablesLength = this.dataSource.data?.reduce(
      (accumulator, row) =>
        this.hasAnyAction(row) || this.selectableCustomEnable(row)
          ? accumulator + 1
          : accumulator,
      0
    );
    // console.log("bugs => isAllSelected => selectablesLength", selectablesLength);
    return (
      this.selection.selected.length === selectablesLength &&
      (this.selection.selected.length || selectablesLength)
    );
  }

  get displayedColumnNames(): string[] {
    return this.displayedColumns
      .filter((col) => !col.hidden)
      .map((c) => c.dataField);
  }

  get displayedColumnFilterNames(): string[] {
    return this.displayedColumns
      .filter((col) => !col.hidden)
      .map((c) => c.dataField + '__filter');
  }

  get paginator(): PaginatorComponent {
    return this._externalPaginator || this._internalPaginator;
  }

  getCellTmpl(name: string): TemplateRef<any> {
    const directive = this.cellTmpls.find((c) => c.name === name);
    if (directive) {
      return directive.templateRef;
    }
    if (this.rowEditCellTmpls) {
      const editDirective = this.rowEditCellTmpls.find((c) => c.name === name);
      return editDirective && editDirective.templateRef;
    }
  }

  getHeaderCellTmpl(name: string): TemplateRef<any> {
    const directive = this.headerCellTmpls.find((h) => h.name === name);
    return directive && directive.templateRef;
  }

  getFormControl(name: string): AbstractControl {
    return this.editRowForm.controls[name];
  }

  private doEachControl(
    fn: (control: AbstractControl, key: string) => void
  ): void {
    for (const key in this.editRowForm.controls) {
      if (this.editRowForm.controls.hasOwnProperty(key)) {
        const control = this.editRowForm.controls[key];
        fn(control, key);
      }
    }
  }

  private updatePaginatorState(): void {
    if (this.paginable && this.paginator && this.state) {
      if (this.state.pageIndex || this.state.pageIndex === 0) {
        this.paginator.pageIndex = +this.state.pageIndex;
      }
      if (this.state.pageSize) {
        this.paginator.pageSize = +this.state.pageSize;
      }
    }
  }

  private updateSortState(): void {
    if (this.sortable && this.sort && this.state) {
      this.sort.direction = this.sortDirection;
      this.sort.active = this.sortField;
    }
  }

  private get sortDirection(): SortDirection {
    const direction = (this.state?.sortOrder as string)?.toLocaleLowerCase();
    return (direction === 'asc' || direction === 'desc'
      ? direction
      : this.defaultSortDirection.toLocaleLowerCase()) as SortDirection;
  }

  private get sortField(): string {
    return this.state?.sortField &&
      this.displayedColumns
        ?.map((c) => c.dataField)
        .some((n) => n === this.state.sortField)
      ? (this.state.sortField as string)
      : this.defaultSort;
  }

  rowIsSelected(row: any): boolean {
    return this.selection && this.selection.selected.indexOf(row) > -1;
  }

  rowIsHidden(row: any): boolean {
    return row?.status === 2;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
