import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnComponent } from './column/column.component';
import { CellDirective } from './directives/cell.directive';
import { HeaderCellDirective } from './directives/header-cell.directive';
import { SelectColumnComponent } from './column/column-templates/select-column/select-column.component';
import { NumberColumnComponent } from './column/column-templates/number-column/number-column.component';
import { TextColumnComponent } from './column/column-templates/text-column/text-column.component';
import { DateColumnComponent } from './column/column-templates/date-column/date-column.component';
import { DropdownColumnComponent } from './column/column-templates/dropdown-column/dropdown-column.component';
import { ActionsColumnComponent } from './column/column-templates/actions-column/actions-column.component';
import { DropdownMultiselectComponent } from './column/column-templates/dropdown-multiselect-column/dropdown-multiselect-column.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { PaginatorComponent } from './paginator/paginator.component';
import { IconModule } from '@optimo/ui-icon';
import { ColVisibilitySelectorComponent } from './col-visibility-selector/col-visibility-selector.component';
import { SelectAllComponent } from './select-all/select-all.component';
import { NumberRangePickerComponent } from './column/column-templates/number-column/number-range-picker/number-range-picker.component';
import { DatePickerModule } from '@optimo/ui-date-picker';
import { ClickOutsideModule } from '@optimo/util-click-outside';
import { IndexColumnComponent } from './column/column-templates/index-column/index-column.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
//  
@NgModule({
	declarations: [
		TableComponent,
		ColumnComponent,
		IndexColumnComponent,
		SelectColumnComponent,
		ActionsColumnComponent,
		NumberColumnComponent,
		TextColumnComponent,
		DateColumnComponent,
		DropdownColumnComponent,
		PaginatorComponent,
		CellDirective,
		HeaderCellDirective,
		ColVisibilitySelectorComponent,
		SelectAllComponent,
		NumberRangePickerComponent,
		DropdownMultiselectComponent,
	],
	exports: [
		TableComponent,
		CellDirective,
		HeaderCellDirective,
		SelectAllComponent,
		PaginatorComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		CdkTableModule,
		IconModule,
		MatIconModule,
		MatPaginatorModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		DatePickerModule,
		MatTooltipModule,
		ClickOutsideModule,
		NgSelectModule,
		FormsModule,
		TranslateModule.forChild(),
		//  
	],
})
export class TableModule { }
