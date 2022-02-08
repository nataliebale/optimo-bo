import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';

import { AddSupplierProductsComponent } from './add-supplier-products.component';
import { AddSupplierProductsRoutingModule } from './add-supplier-products-routing.module';
import { FileUploaderModule } from '@optimo/ui-file-uploader';
import { TableModule } from '@optimo/ui-table';
import { TranslateModule } from '@ngx-translate/core';
// import { CancelModalComponent } from './cancel-modal/cancel-modal.component';

const MODULES = [
  CommonModule,
  AddSupplierProductsRoutingModule,
  FormsModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatInputModule,
  MatSelectModule,
  MatFormFieldModule,
  MatDialogModule,
  FileUploaderModule,
  MatTableModule,
  MatTabsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatGridListModule,
  MatAutocompleteModule,
  TableModule,
  TranslateModule.forChild(),
];

const ENTRY_COMPONENTS = [
  //   CancelModalComponent
];

@NgModule({
  declarations: [
    AddSupplierProductsComponent,
    // CancelModalComponent,
    // ENTRY_COMPONENTS
  ],
  entryComponents: ENTRY_COMPONENTS,
  imports: MODULES,
})
export class AddSupplierProductsModule {}
